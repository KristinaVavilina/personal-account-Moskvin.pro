using Domain.Models.Users;

namespace Domain.Interfaces.Repositories.Users;

public interface IUserRepository : IRepository<User, Guid>
{
    Task<IEnumerable<User>> GetByArchiveStatusAsync(bool isArchived);

    Task<User?> GetByEmailAsync(string email);

    Task<User?> GetByTokenHashAsync(string tokenHash);
}