namespace server.DTOs;

public class ClientChatHistoryDto
{
    public string ClientId { get; set; } = null!;
    public string? ClientName { get; set; }
    public int TotalChats { get; set; }
    public DateTime? LastContact { get; set; }
    public List<ChatSummaryDto> Chats { get; set; } = new();
    public double? Satisfaction { get; set; } // Si tienes este dato
}

public class ChatSummaryDto
{
    public int ChatSessionId { get; set; }
    public string? SystemName { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public int MessageCount { get; set; }
    public string? LastMessage { get; set; }
    public DateTime? LastMessageAt { get; set; }
    public int UnreadCount { get; set; }
    public int ReadCount { get; set; }
    public string? AgentName { get; set; }
    public double? Satisfaction { get; set; }
    public bool IsClosed { get; set; }
    public int? AgentId { get; set; }
}
