using Application.DTO.Users.Auth;
using Application.DTO.Users.User;
using Domain.Errors;

namespace Application.Interfaces.Services.Users;

public interface IAuthService
{
    Task<Result<AuthResponse>> LoginAsync(LoginRequest request);

    Task<Result<bool>> CompleteRegistrationAsync(RegisterRequest request);

    Task<Result<string>> InviteEmployeeAsync(UserRequest request);
}