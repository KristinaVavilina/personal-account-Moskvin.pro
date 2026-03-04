using Domain.Models.TimeLogs;

namespace Domain.Interfaces.Repositories.TimeLogs;

public interface ITimeLogRepository : IRepository<TimeLog, Guid>
{
    Task<IEnumerable<TimeLog>> GetTimeLogsAsync(Guid userId, DateOnly startDate, DateOnly endDate);

    Task<IEnumerable<Guid>> GetTaskIdListAsync(Guid userId, DateOnly startDate, DateOnly endDate);
}