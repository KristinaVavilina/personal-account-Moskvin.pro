using Domain.Models.Users;

namespace Application.Interfaces.Services;

public interface IJwtTokenService
{
    string CreateAccessToken(User user);
}
