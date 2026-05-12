using Domain.Enums;

namespace Application.DTO.Users.Auth;

public class AuthResponse
{
    public required string Token { get; set; }

    public Guid UserId { get; set; }

    public required string FullName { get; set; }

    public UserRole Role { get; set; }

    public string? PhotoUrl { get; set; }
}