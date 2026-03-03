using Domain.Models.KnowledgeBase;
using Domain.Models.Users;
using Domain.Models.System;
using Domain.Models.TimeLogs;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public class AppDbContext : DbContext
{
    public DbSet<User> Users { get; set; }

    public DbSet<Position> Positions { get; set; }

    public DbSet<TaskType> TaskTypes { get; set; }

    public DbSet<Domain.Models.TimeLogs.Task> Tasks { get; set; }

    public DbSet<TimeLog> TimeLogs { get; set; }

    public DbSet<KnowledgeBaseItem> KnowledgeBaseItems { get; set; }

    public DbSet<QuickLink> QuickLinks { get; set; }

    public DbSet<SystemSetting> SystemSettings { get; set; }

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(u => u.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(u => u.IsArchived).HasDefaultValue(true);
        });

        modelBuilder.Entity<Domain.Models.TimeLogs.Task>(entity =>
        {
            entity.Property(t => t.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(t => t.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(t => t.CurrentProgress).HasDefaultValue(0);
            entity.Property(t => t.IsArchived).HasDefaultValue(false);
        });

        modelBuilder.Entity<TimeLog>(entity =>
        {
            entity.Property(tl => tl.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(tl => tl.CreatedAt).HasDefaultValueSql("now()");
        });

        modelBuilder.Entity<KnowledgeBaseItem>(entity =>
        {
            entity.Property(kb => kb.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(kb => kb.IsArchived).HasDefaultValue(false);
        });
    }
}