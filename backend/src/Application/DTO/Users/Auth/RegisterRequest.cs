namespace Application.DTO.Users.Auth;

public class RegisterRequest
{
    public required string Token { get; set; }

    public required string Password { get; set; }
}