using Domain.Enums;
using Domain.Interfaces.Repositories.TimeLogs;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories.TimeLogs;

public class TaskRepository(AppDbContext context)
    : BaseRepository<Domain.Models.TimeLogs.Task, Guid>(context), ITaskRepository
{
    public async Task<IEnumerable<Domain.Models.TimeLogs.Task>> GetUserTasksAsync(Guid userId, bool isArchived)
    {
        return await _dbSet
            .Where(x => x.UserId == userId && x.IsArchived == isArchived)
            .ToListAsync();
    }

    public async Task<int> GetCompletedTasksCountAsync(Guid userId, DateTime startDate, DateTime endDate)
    {
        return await _dbSet
            .Where(x => x.CurrentProgress == TaskProgress.Completed)
            .CountAsync();
    }
}