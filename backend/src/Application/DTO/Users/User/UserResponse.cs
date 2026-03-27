using Domain.Enums;

namespace Application.DTO.Users.User;

public class UserResponse
{
    public Guid Id { get; set; }

    public required string Email { get; set; }

    public string? PasswordHash { get; set; }

    public required string FullName { get; set; }

    public string? PhotoUrl { get; set; }

    public required UserRole Role { get; set; }

    public string? PositionName { get; set; }
}