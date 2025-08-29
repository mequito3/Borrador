namespace server.DTOs;

public class CreateSystemOriginDto
{
    public string Name { get; set; } = default!;
    public string Code { get; set; } = default!;
    public string? ApiKey { get; set; }
    public bool IsActive { get; set; } = true;
}
