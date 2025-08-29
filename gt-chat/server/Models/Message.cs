namespace server.Models;

public class Message
{
    public int Id { get; set; }
    public int ChatSessionId { get; set; }
    
    
    public ChatSession? ChatSession { get; set; }

    public string Sender { get; set; } = null!; // "agent" or "client"
    public string? Content { get; set; }
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public bool IsRead { get; set; } = false;

    public int SystemOriginId { get; set; }
    public SystemOrigin? SystemOrigin { get; set; }

    public ICollection<Attachment>? Attachments { get; set; }
}
