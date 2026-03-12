using Domain.Enums;

namespace Application.DTO.Users.User;

public class UserRequest
{
    public required string Email { get; set; }

    public string? Password { get; set; }

    public required string FullName { get; set; }

    public string? PhotoUrl { get; set; }

    public required UserRole Role { get; set; }

    public int? PositionId { get; set; }
}