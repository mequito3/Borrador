using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using server.Models;
using server.DTOs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;

namespace server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly JwtSettings _jwtSettings;

    public AuthController(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _jwtSettings = config.GetSection("JwtSettings").Get<JwtSettings>()!;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var agent = await _context.Agents
            .FirstOrDefaultAsync(a => a.Username == dto.Username && a.IsActive);

        if (agent == null || !BCrypt.Net.BCrypt.Verify(dto.Password, agent.PasswordHash))
            return Unauthorized("Credenciales inválidas");

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, agent.Username),
            new Claim("agentId", agent.Id.ToString()),
            new Claim(ClaimTypes.Role, "Agent")
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes),
            signingCredentials: creds
        );

        return Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
    }
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterAgentDto dto)
    {
        var exists = await _context.Agents.AnyAsync(a => a.Username == dto.Username);
        if (exists)
            return Conflict("El nombre de usuario ya está en uso.");

        var agent = new Agent
        {
            Username = dto.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            IsActive = true
        };

        _context.Agents.Add(agent);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            agent.Id,
            agent.Username
        });
    }

}
