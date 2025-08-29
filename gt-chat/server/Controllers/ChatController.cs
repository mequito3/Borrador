using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using server.Models;
using server.DTOs;
using server.Hubs;

namespace server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IHubContext<ChatHub> _hubContext;

    public ChatController(AppDbContext context, IHubContext<ChatHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    [HttpPost("start")]
    public async Task<IActionResult> StartChat([FromBody] StartChatDto dto)
    {
        var system = await _context.SystemOrigins.FirstOrDefaultAsync(s => s.Code == dto.SystemCode);
        if (system == null)
            return BadRequest("System not registered.");

        var session = new ChatSession
        {
            ClientId = dto.ClientId,
            ClientName = dto.ClientName,

            SystemOriginId = system.Id,
            StartedAt = DateTime.UtcNow
        };

        _context.ChatSessions.Add(session);
        await _context.SaveChangesAsync();

    // Importante: el frontend espera "id" en minúsculas
    return Ok(new { id = session.Id });
    }


    [HttpPost("send")]
    public async Task<IActionResult> SendMessage([FromBody] SendMessageDto dto)
    {
        var chat = await _context.ChatSessions.FindAsync(dto.ChatSessionId);
        if (chat == null || chat.IsClosed)
            return BadRequest("Chat not found or already closed.");

        var message = new Message
        {
            ChatSessionId = dto.ChatSessionId,
            Sender = dto.Sender,
            Content = dto.Content,
            SentAt = DateTime.UtcNow,
            SystemOriginId = dto.SystemOriginId
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        // Obtener attachments si existen (por si el frontend los asocia después)
        var attachments = await _context.Attachments
            .Where(a => a.MessageId == message.Id)
            .ToListAsync();

        var attachmentDtos = attachments.Select(a => new AttachmentDto
        {
            FileName = a.FileName,
            FileType = a.FileType,
            FilePath = a.FilePath.Replace("\\", "/")
        }).ToList();

        // Emitir mensaje solo al grupo correcto para evitar duplicados
        await _hubContext.Clients.Group(dto.ChatSessionId.ToString()).SendAsync(
            "ReceiveMessage",
            dto.ChatSessionId,
            dto.Sender,
            dto.Content,
            message.SentAt,
            attachmentDtos // Enviar los attachments también por SignalR
        );

        return Ok(new MessageDto
        {
            Sender = message.Sender,
            Content = message.Content ?? string.Empty,
            SentAt = message.SentAt,
            Attachments = attachmentDtos,
            Id = message.Id
        });
    }

    [HttpGet("{chatId}/messages")]
    public async Task<IActionResult> GetMessages(int chatId)
    {
        var messages = await _context.Messages
            .Where(m => m.ChatSessionId == chatId)
            .Include(m => m.Attachments)
            .OrderBy(m => m.SentAt)
            .ToListAsync();        var result = messages.Select(m => new MessageDto
        {
            Id = m.Id,
            Sender = m.Sender,
            Content = m.Content ?? string.Empty,
            SentAt = m.SentAt,
            Attachments = (m.Attachments ?? new List<Attachment>()).Select(a => new AttachmentDto
            {
                FileName = a.FileName,
                FileType = a.FileType,
                FilePath = a.FilePath.Replace("\\", "/") // compatibilidad frontend
            }).ToList()
        });

        return Ok(result);
    }



    [Authorize]
    [HttpGet("active-sessions")]
    public async Task<IActionResult> GetActiveSessions()
    {
        var sessions = await _context.ChatSessions
            .Include(s => s.SystemOrigin)
            .Include(s => s.Messages)
            .Where(s => !s.IsClosed)
            .OrderByDescending(s => s.StartedAt)
            .ToListAsync();

        var result = sessions.Select(s =>
        {
            var lastMsg = (s.Messages ?? new List<Message>()).OrderByDescending(m => m.SentAt).FirstOrDefault();
            return new
            {
                s.Id,
                s.ClientId,
                s.ClientName,
                SystemName = s.SystemOrigin?.Name ?? "Desconocido",
                LastMessage = lastMsg?.Content ?? "(sin mensajes)",
                Time = lastMsg != null ? lastMsg.SentAt.ToString("HH:mm") : "--:--", // SIEMPRE presente
                UnreadCount = (s.Messages ?? new List<Message>()).Count(m => m.Sender == "client" && !m.IsRead)
            };
        });

        return Ok(result);
    }

    [Authorize] // sin roles
    [HttpPost("{id}/close")]
    public async Task<IActionResult> CloseSession(int id)
    {
        var session = await _context.ChatSessions.FindAsync(id);
        if (session == null) return NotFound("La sesión no existe.");
        if (session.IsClosed) return BadRequest("La sesión ya está cerrada.");

        session.IsClosed = true;
        session.EndedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Notificar al cliente que el chat ha sido cerrado
        await _hubContext.Clients.Group(id.ToString()).SendAsync(
            "ChatClosed",
            id,
            "El soporte ha finalizado esta conversación. Gracias por contactarnos.",
            DateTime.UtcNow
        );

        return Ok(new { message = $"Sesión #{id} cerrada correctamente." });
    }
    [HttpGet("closed-sessions")]
    [Authorize] // sin roles
    public async Task<IActionResult> GetClosedSessions()
    {
        var sessions = await _context.ChatSessions
            .Include(s => s.SystemOrigin)
            .Where(s => s.IsClosed == true)
            .OrderByDescending(s => s.EndedAt)
            .Select(s => new
            {
                s.Id,
                s.ClientName,
                SystemName = s.SystemOrigin != null ? s.SystemOrigin.Name : "Desconocido",
                ClosedAt = s.EndedAt
            })
            .ToListAsync();

        return Ok(sessions);
    }


    [Authorize(Roles = "Agent")]
    [HttpGet("stats")]
    public async Task<IActionResult> GetStatistics()
    {
        var totalSessions = await _context.ChatSessions.CountAsync();
        var closedSessions = await _context.ChatSessions.CountAsync(s => s.IsClosed);
        var activeSessions = await _context.ChatSessions.CountAsync(s => !s.IsClosed);
        var lastSession = await _context.ChatSessions
            .OrderByDescending(s => s.StartedAt)
            .Select(s => s.StartedAt)
            .FirstOrDefaultAsync();

        return Ok(new
        {
            totalSessions,
            activeSessions,
            closedSessions,
            lastSession
        });
    }

    [Authorize]
    [HttpPost("{chatId}/mark-read")]
    public async Task<IActionResult> MarkMessagesAsRead(int chatId)
    {
        var messages = await _context.Messages
            .Where(m => m.ChatSessionId == chatId && m.Sender == "client" && !m.IsRead)
            .ToListAsync();

        foreach (var msg in messages)
            msg.IsRead = true;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Mensajes marcados como leídos." });
    }

    [HttpGet("client-history/{clientId}")]
    [Authorize]
    public IActionResult GetClientHistory(string clientId)
    {
        var db = HttpContext.RequestServices.GetService<server.Models.AppDbContext>();
        if (db == null) return StatusCode(500);

        var sessions = db.ChatSessions
            .Where(s => s.ClientId == clientId)
            .OrderByDescending(s => s.StartedAt)
            .ToList();

        if (!sessions.Any())
            return NotFound();

        var chats = sessions.Select(s =>
        {
            var lastMsg = db.Messages
                .Where(m => m.ChatSessionId == s.Id)
                .OrderByDescending(m => m.SentAt)
                .FirstOrDefault();
            var unreadCount = db.Messages.Count(m => m.ChatSessionId == s.Id && m.Sender == "client" && !m.IsRead);
            var readCount = db.Messages.Count(m => m.ChatSessionId == s.Id && m.Sender == "client" && m.IsRead);
            var agentName = s.Agent != null ? s.Agent.Username : null;
            var satisfaction = s.GetType().GetProperty("Satisfaction") != null ? (double?)s.GetType().GetProperty("Satisfaction")?.GetValue(s) : null;
            return new ChatSummaryDto
            {
                ChatSessionId = s.Id,
                SystemName = s.SystemOrigin != null ? s.SystemOrigin.Name : "Desconocido",
                StartedAt = s.StartedAt,
                EndedAt = s.EndedAt,
                MessageCount = db.Messages.Count(m => m.ChatSessionId == s.Id),
                LastMessage = lastMsg != null ? lastMsg.Content : null,
                LastMessageAt = lastMsg != null ? lastMsg.SentAt : null,
                UnreadCount = unreadCount,
                ReadCount = readCount,
                AgentName = agentName,
                Satisfaction = satisfaction,
                IsClosed = s.IsClosed,
                AgentId = s.AgentId
            };
        }).ToList();

        var lastContact = sessions.MaxBy(s => s.EndedAt ?? s.StartedAt)?.EndedAt ?? sessions.MaxBy(s => s.StartedAt)?.StartedAt;

        var satisfaction = sessions
            .Where(s => s.Satisfaction != null)
            .OrderByDescending(s => s.EndedAt)
            .Select(s => s.Satisfaction)
            .FirstOrDefault();

        var dto = new ClientChatHistoryDto
        {
            ClientId = clientId,
            ClientName = sessions.First().ClientName,
            TotalChats = sessions.Count,
            LastContact = lastContact,
            Chats = chats,
            Satisfaction = satisfaction // Si tienes un campo de satisfacción, cámbialo aquí
        };
        return Ok(dto);
    }

    [HttpPost("{id}/satisfaction")]
    public async Task<IActionResult> SetSatisfaction(int id, [FromBody] double satisfaction)
    {
        var session = await _context.ChatSessions.FindAsync(id);
        if (session == null) return NotFound("La sesión no existe.");
        session.Satisfaction = satisfaction;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Satisfacción guardada." });
    }

}
