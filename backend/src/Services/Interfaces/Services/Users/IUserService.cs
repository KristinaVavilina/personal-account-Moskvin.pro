using Applicatiion.Interfaces.Services;
using Application.DTO.Users.User;
using Domain.Errors;

namespace Application.Interfaces.Services.Users;

public interface IUserService
    : IService<UserRequest, UserResponse, Guid>
{
    Task<Result<IEnumerable<UserResponse>>> GetByArchiveStatusAsync(bool isArchived);
}