using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using server.Models;
using server.DTOs;
using server.Hubs;
namespace server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AttachmentController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IHubContext<ChatHub> _hubContext;
    
    public AttachmentController(AppDbContext context, IHubContext<ChatHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _context.Attachments.ToListAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await _context.Attachments.FindAsync(id);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Attachment item)
    {
        _context.Attachments.Add(item);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.Attachments.FindAsync(id);
        if (item == null) return NotFound();
        _context.Attachments.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }

[HttpPost("upload")]
public async Task<IActionResult> UploadFile(IFormFile file, [FromForm] int messageId)
{
    if (file == null || file.Length == 0)
        return BadRequest("Archivo no proporcionado.");

    var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "UploadedFiles");
    if (!Directory.Exists(uploadsFolder))
        Directory.CreateDirectory(uploadsFolder);

    var fileName = Guid.NewGuid() + Path.GetExtension(file.FileName);
    var fullFilePath = Path.Combine(uploadsFolder, fileName);

    // Guarda físicamente el archivo
    using (var stream = new FileStream(fullFilePath, FileMode.Create))
    {
        await file.CopyToAsync(stream);
    }

    // ✅ Solo guarda la ruta relativa (para el frontend)
    var relativePath = Path.Combine("UploadedFiles", fileName).Replace("\\", "/");

    var attachment = new Attachment
    {
        FileName = file.FileName,
        FileType = file.ContentType,
        FilePath = relativePath, // 👈 Aquí el cambio importante
        MessageId = messageId
    };

    _context.Attachments.Add(attachment);
    await _context.SaveChangesAsync();

    // 🔁 Obtener mensaje con attachments actualizados
    var message = await _context.Messages
        .Include(m => m.Attachments)
        .FirstOrDefaultAsync(m => m.Id == messageId);

    if (message == null)
        return NotFound();    var result = new MessageDto
    {
        Id = message.Id,
        Sender = message.Sender,
        Content = message.Content ?? string.Empty,
        SentAt = message.SentAt,
        Attachments = (message.Attachments ?? new List<Attachment>()).Select(a => new AttachmentDto
        {
            FileName = a.FileName,
            FileType = a.FileType,
            FilePath = a.FilePath // Ya está con slashes correctos
        }).ToList()
    };

    // Emitir mensaje actualizado por SignalR SOLO con el attachment, sin texto
    await _hubContext.Clients.Group(message.ChatSessionId.ToString()).SendAsync(
        "ReceiveMessage",
        message.ChatSessionId,
        message.Sender,
        "", // ← Vacío para que solo muestre la imagen sin texto "[Archivo]"
        message.SentAt,
        result.Attachments
    );

    return Ok(result);
}



}
