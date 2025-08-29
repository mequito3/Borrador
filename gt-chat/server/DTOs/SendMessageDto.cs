namespace server.DTOs;

public class SendMessageDto
{
    public int ChatSessionId { get; set; }
    public string Sender { get; set; } = null!; // "agent" o "client"
    public string? Content { get; set; }
    public int SystemOriginId { get; set; }
}
