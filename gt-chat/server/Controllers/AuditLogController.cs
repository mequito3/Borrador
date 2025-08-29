using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Models;

namespace server.Controllers;
[ApiController]
[Route("api/[controller]")]
public class AuditLogController : ControllerBase
{
    private readonly AppDbContext _context;
    public AuditLogController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _context.AuditLogs.OrderByDescending(a => a.Timestamp).ToListAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var log = await _context.AuditLogs.FindAsync(id);
        return log == null ? NotFound() : Ok(log);
    }
}