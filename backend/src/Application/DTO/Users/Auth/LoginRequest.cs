using System.ComponentModel.DataAnnotations;

namespace Application.DTO.Users.Auth;

public class LoginRequest
{
    [Required(ErrorMessage = "Email обязателен")]
    [EmailAddress(ErrorMessage = "Неверный формат почты")]
    [RegularExpression(@"^[a-zA-Z0-9._%+-]+@moskvin\.pro$", ErrorMessage = "Разрешена только корпоративная почта @moskvin.pro")]
    public required string Email { get; set; }

    public required string Password { get; set; }
}