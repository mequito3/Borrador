public class StartChatDto
{
    public string ClientId { get; set; } = null!;
    public string SystemCode { get; set; } = null!;
    public string? ClientName { get; set; } // 👈 ya sea opcional o requerido
}
