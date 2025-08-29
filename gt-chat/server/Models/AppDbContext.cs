using Microsoft.EntityFrameworkCore;

namespace server.Models;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }
    public DbSet<SystemOrigin> SystemOrigins => Set<SystemOrigin>();
    public DbSet<Agent> Agents => Set<Agent>();
    public DbSet<ChatSession> ChatSessions => Set<ChatSession>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<Attachment> Attachments => Set<Attachment>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<Product> Products { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Product>()
            .Property(p => p.Price)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<SystemOrigin>()
            .HasIndex(s => s.Code)
            .IsUnique();

        modelBuilder.Entity<Agent>()
            .HasIndex(a => a.Username)
            .IsUnique();
    }
}