using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Models;

namespace server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Product
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            return await _context.Products.Where(p => !p.Inactive).ToListAsync();
        }

        // POST: api/Product
        [HttpPost]
        public async Task<ActionResult<Product>> PostProduct(Product product)
        {
            product.CreatedAt = DateTime.UtcNow;
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProducts), new { id = product.Id }, product);
        }

        // GET: api/Product/SeedData
        [HttpGet("SeedData")]
        public async Task<ActionResult> SeedData()
        {
            if (!_context.Products.Any())
            {
                var products = new List<Product>
                {
                    new Product { Name = "Laptop", Description = "Portátil de última generación", Price = 999.99M },
                    new Product { Name = "Smartphone", Description = "Teléfono inteligente", Price = 599.99M },
                    new Product { Name = "Tablet", Description = "Tablet de 10 pulgadas", Price = 299.99M }
                };

                _context.Products.AddRange(products);
                await _context.SaveChangesAsync();
                return Ok("Datos de prueba creados exitosamente");
            }

            return Ok("Los datos de prueba ya existen");
        }
    }
} 