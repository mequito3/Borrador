namespace server.Models;

public class Agent
{
    public int Id { get; set; }
    public string Username { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public bool IsActive { get; set; } = true;

    public ICollection<ChatSession>? ChatSessions { get; set; }
}
