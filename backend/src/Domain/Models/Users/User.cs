using Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Models.Users;

public class User
{
    [Key]
    public Guid Id { get; set; }

    public required string Email { get; set; }

    public string? PasswordHash { get; set; }

    public required string FullName { get; set; }

    public string? PhotoUrl { get; set; }

    public required UserRole Role { get; set; }

    public int? PositionId { get; set; }

    [ForeignKey(nameof(PositionId))]
    public Position? Position { get; set; }

    public required bool IsArchived { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }
}