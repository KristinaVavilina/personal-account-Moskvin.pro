using Domain.Enums.Users;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Models;

public class User
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    public string FullName { get; set; } = string.Empty;

    public string? PhotoUrl { get; set; }

    [Required]
    public UserRole Role { get; set; }

    public int? PositionId { get; set; }

    [ForeignKey(nameof(PositionId))]
    public Position? Position { get; set; }

    [Required]
    public UserStatus Status { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }
}