namespace server.Models;

public class AuditLog
{
    public int Id { get; set; }
    public string Action { get; set; } = null!;
    public string? User { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? Details { get; set; }
}
