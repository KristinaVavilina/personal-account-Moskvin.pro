using Applicatiion.Interfaces.Services;
using Application.DTO.TimeLogs.TimeLog;
using Domain.Errors;

namespace Application.Interfaces.Services.TimeLogs;

public interface ITimeLogService
    : IService<TimeLogRequest, TimeLogResponse, Guid>
{
    Task<Result<IEnumerable<TimeLogResponse>>> GetTimeLogsAsync(Guid userId, DateOnly startDate, DateOnly endDate);

    Task<Result<IEnumerable<Guid>>> GetTaskIdListAsync(Guid userId, DateOnly startDate, DateOnly endDate);
}