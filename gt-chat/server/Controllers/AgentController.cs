using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Models;

namespace server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AgentController : ControllerBase
{
    private readonly AppDbContext _context;

    public AgentController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _context.Agents.ToListAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var agent = await _context.Agents.FindAsync(id);
        return agent == null ? NotFound() : Ok(agent);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Agent agent)
    {
        _context.Agents.Add(agent);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = agent.Id }, agent);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Agent updated)
    {
        if (id != updated.Id) return BadRequest();
        _context.Entry(updated).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var agent = await _context.Agents.FindAsync(id);
        if (agent == null) return NotFound();
        _context.Agents.Remove(agent);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
