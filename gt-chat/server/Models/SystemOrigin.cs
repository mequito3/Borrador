namespace server.Models;

public class SystemOrigin
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Code { get; set; } = null!;
    public string? ApiKey { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<ChatSession>? ChatSessions { get; set; }
}
