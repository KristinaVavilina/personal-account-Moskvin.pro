using Domain.Models.TimeLogs;

namespace Domain.Interfaces.TimeLogs;

public interface ITimeLogRepository: IRepository<TimeLog, Guid>
{
    Task<IEnumerable<TimeLog>> GetTimeLogsAsync(Guid userId, DateTime startDate, DateTime endDate);

    Task<IEnumerable<Guid>> GetTaskIdListAsync(Guid userId, DateTime startDate, DateTime endDate);
}