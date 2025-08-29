namespace server.Models;

public class Attachment
{
    public int Id { get; set; }
    public int MessageId { get; set; }
    public Message? Message { get; set; }

    public string FileName { get; set; } = null!;
    public string FileType { get; set; } = null!;
    public string FilePath { get; set; } = null!;
}
