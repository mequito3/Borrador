namespace server.DTOs;

public class MessageDto
{
    public int Id { get; set; } // Agregar propiedad Id para el identificador del mensaje
    public string Sender { get; set; } = null!;
    public string Content { get; set; } = null!;
    public DateTime SentAt { get; set; }
    public List<AttachmentDto> Attachments { get; set; } = new();
}
