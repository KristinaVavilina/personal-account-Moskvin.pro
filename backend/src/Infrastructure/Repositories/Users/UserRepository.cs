using Domain.Interfaces.Repositories.Users;
using Domain.Models.Users;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories.Users;

public class UserRepository(AppDbContext context)
    : BaseRepository<User, Guid>(context), IUserRepository
{
    public async Task<IEnumerable<User>> GetByArchiveStatusAsync(bool isArchived)
    {
        return await _dbSet
            .Where(x => x.IsArchived == isArchived)
            .ToListAsync();
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _dbSet.FirstOrDefaultAsync(x => x.Email == email);
    }

    public async Task<User?> GetByTokenHashAsync(string tokenHash)
    {
        return await _dbSet.FirstOrDefaultAsync(x => x.InviteTokenHash == tokenHash);
    }
}