using Applicatiion.Interfaces.Services;
using Application.DTO.TimeLogs.TimeLog;

namespace Application.Interfaces.Services.TimeLogs;

public interface ITimeLogService
    : IService<TimeLogRequest, TimeLogResponse, Guid>
{
    Task<IEnumerable<TimeLogResponse>> GetTimeLogsAsync(Guid userId, DateOnly startDate, DateOnly endDate);

    Task<IEnumerable<Guid>> GetTaskIdListAsync(Guid userId, DateOnly startDate, DateOnly endDate);
}