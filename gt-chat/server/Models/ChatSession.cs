using System.ComponentModel.DataAnnotations.Schema;

namespace server.Models;

public class ChatSession
{
    public int Id { get; set; }
    public string ClientId { get; set; } = null!;
    public string? ClientName { get; set; }
    
    public int SystemOriginId { get; set; }
    public SystemOrigin? SystemOrigin { get; set; }

    public int? AgentId { get; set; }
    public Agent? Agent { get; set; }

    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? EndedAt { get; set; }
    public bool IsClosed { get; set; } = false;

    public double? Satisfaction { get; set; } // Nuevo campo para satisfacción

    public ICollection<Message>? Messages { get; set; }
}
