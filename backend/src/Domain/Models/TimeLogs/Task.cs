using Domain.Models.Users;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Models.TimeLogs;

public class Task
{
    [Key]
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    public int TypeId { get; set; }

    [ForeignKey(nameof(TypeId))]
    public Type? Type { get; set; }

    public required string Title { get; set; }

    public string? Description { get; set; }

    public int CurrentProgress { get; set; }

    public bool IsArchived { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime ArchivedAt { get; set; }
}