using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Models;
using server.DTOs;

namespace server.Controllers;
[ApiController]
[Route("api/[controller]")]
public class SystemOriginController : ControllerBase
{
    private readonly AppDbContext _context;
    public SystemOriginController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _context.SystemOrigins.ToListAsync());

    [HttpGet("{id}")]
public async Task<IActionResult> GetById(int id)
{
    var origin = await _context.SystemOrigins.FindAsync(id);
    if (origin == null) return NotFound();

    return Ok(origin);
}

[HttpPost]
public async Task<IActionResult> Create([FromBody] CreateSystemOriginDto dto)
{
    var origin = new SystemOrigin
    {
        Name = dto.Name,
        Code = dto.Code,
        ApiKey = dto.ApiKey,
        IsActive = dto.IsActive
    };

    _context.SystemOrigins.Add(origin);
    await _context.SaveChangesAsync();

    return CreatedAtAction(nameof(GetById), new { id = origin.Id }, origin);
}


    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, SystemOrigin sys)
    {
        if (id != sys.Id) return BadRequest();
        _context.Entry(sys).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var sys = await _context.SystemOrigins.FindAsync(id);
        if (sys == null) return NotFound();
        _context.SystemOrigins.Remove(sys);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
