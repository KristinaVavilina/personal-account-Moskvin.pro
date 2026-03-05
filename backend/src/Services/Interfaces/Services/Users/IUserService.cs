using Applicatiion.Interfaces.Services;
using Application.DTO.Users.User;

namespace Application.Interfaces.Services.Users;

public interface IUserService
    : IService<UserRequest, UserResponse, Guid>
{
    Task<IEnumerable<UserResponse>> GetByArchiveStatusAsync(bool isArchived);
}