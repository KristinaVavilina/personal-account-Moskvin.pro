using Application.DTO.Users.User;
using Application.Interfaces.Services.Users;
using AutoMapper;
using Domain.Errors;
using Domain.Interfaces.Repositories.Users;
using Domain.Models.Users;
using Serilog;

namespace Application.Services.Users;

public class UserService(IUserRepository repository, IMapper mapper)
    : BaseService<User, UserRequest, UserResponse, Guid>(repository, mapper), IUserService
{
    public async Task<Result<IEnumerable<UserResponse>>> GetByArchiveStatusAsync(bool isArchived)
    {
        var entities = await repository.GetByArchiveStatusAsync(isArchived);
        var response = _mapper.Map<IEnumerable<UserResponse>>(entities);
        var count = response.Count();

        if (count == 0)
        {
            Log.Warning("Запрошен список пользователей (Архив: {IsArchived}), но база данных пуста", isArchived);
        }
        else
        {
            Log.Information("Успешно получено {Count} пользователей (Архив: {IsArchived})", count);
        }

        return Result<IEnumerable<UserResponse>>.Success(response);
    }
}