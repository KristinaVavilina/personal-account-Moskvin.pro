using Domain.Interfaces.Repositories.TimeLogs;
using Domain.Models.TimeLogs;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories.TimeLogs;

public class TimeLogRepository(AppDbContext context)
    : BaseRepository<TimeLog, Guid>(context), ITimeLogRepository
{
    public async Task<IEnumerable<TimeLog>> GetTimeLogsAsync(Guid userId, DateOnly startDate, DateOnly endDate)
    {
        return await _dbSet
            .Where(x => x.UserId == userId
                        && x.Date >= startDate
                        && x.Date <= endDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<Guid>> GetTaskIdListAsync(Guid userId, DateOnly startDate, DateOnly endDate)
    {
        return await _dbSet
            .Where(x => x.UserId == userId
                        && x.Date >= startDate
                        && x.Date <= endDate)
            .Select(x => x.Id)
            .ToListAsync();
    }
}