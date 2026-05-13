using Application.DTO.Users.Auth;
using Application.DTO.Users.User;
using Application.Helpers;
using Application.Interfaces.Services;
using Application.Interfaces.Services.Users;
using Domain.Errors;
using Domain.Interfaces.Repositories.Users;
using Domain.Models.Users;
using Serilog;

namespace Application.Services.Users;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthService(IUserRepository userRepository, IJwtTokenService jwtTokenService)
    {
        _userRepository = userRepository;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<Result<AuthResponse>> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);

        if (user == null
            || string.IsNullOrEmpty(user.PasswordHash)
            || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Result<AuthResponse>.Failure("Неверный логин или пароль");
        }

        return Result<AuthResponse>.Success(new AuthResponse
        {
            Token = _jwtTokenService.CreateAccessToken(user),
            FullName = user.FullName,
            UserId = user.Id,
            Role = user.Role
        });
    }

    public async Task<Result<bool>> CompleteRegistrationAsync(RegisterRequest request)
    {
        var incomingTokenHash = HashHelper.ComputeSha256Hash(request.Token);
        var user = await _userRepository.GetByTokenHashAsync(incomingTokenHash);

        if (user == null)
        {
            return Result<bool>.Failure("Неверный или просроченный токен приглашения");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        user.IsArchived = false;
        user.InviteTokenHash = null;

        await _userRepository.UpdateAsync(user);

        return Result<bool>.Success(true);
    }

    public async Task<Result<string>> InviteEmployeeAsync(UserRequest request)
    {
        var rawToken = Guid.NewGuid().ToString("N");

        var tokenHash = HashHelper.ComputeSha256Hash(rawToken);

        var user = new User
        {
            Email = request.Email,
            FullName = request.FullName,
            Role = request.Role,
            PositionId = request.PositionId,
            IsArchived = true,
            InviteTokenHash = tokenHash,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user);

        var inviteLink = $"https://moskvin.pro/complete-registration?token={rawToken}";

        Log.Information("Создано приглашение для {Email}. Ссылка: {Link}", request.Email, inviteLink);

        return Result<string>.Success(inviteLink);
    }
}