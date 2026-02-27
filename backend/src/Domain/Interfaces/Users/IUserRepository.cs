using Domain.Models.Users;

namespace Domain.Interfaces.Users;

public interface IUserRepository: IRepository<User, Guid>
{
    Task<IEnumerable<User>> GetByArchiveStatusAsync(bool isArchived);
}