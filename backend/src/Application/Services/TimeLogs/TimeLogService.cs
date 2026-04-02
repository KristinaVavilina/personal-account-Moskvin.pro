using Application.DTO.TimeLogs.TimeLog;
using Application.Interfaces.Services.TimeLogs;
using AutoMapper;
using Domain.Errors;
using Domain.Interfaces.Repositories.TimeLogs;
using Domain.Models.TimeLogs;
using Serilog;

namespace Application.Services.TimeLogs;

public class TimeLogService(ITimeLogRepository repository, IMapper mapper)
    : BaseService<TimeLog, TimeLogRequest, TimeLogResponse, Guid>(repository, mapper), ITimeLogService
{
    public async Task<Result<IEnumerable<TimeLogResponse>>> GetTimeLogsAsync(Guid userId, DateOnly startDate, DateOnly endDate)
    {
        var entities = await repository.GetTimeLogsAsync(userId, startDate, endDate);
        var response = _mapper.Map<IEnumerable<TimeLogResponse>>(entities);
        var count = response.Count();

        Log.Information("Получено {Count} отчетностей пользователя {UserId}в период с {StartDate} по {EndDate}",
            count, userId, startDate, endDate);

        return Result<IEnumerable<TimeLogResponse>>.Success(response);
    }

    public async Task<Result<IEnumerable<Guid>>> GetTaskIdListAsync(Guid userId, DateOnly startDate, DateOnly endDate)
    {
        var entities = await repository.GetTaskIdListAsync(userId, startDate, endDate);
        var response = _mapper.Map<IEnumerable<Guid>>(entities);
        var count = response.Count();

        Log.Information("Получено {Count} записей пользователя {UserId} за период с {StartDate} по {EndDate}",
            count, userId, startDate, endDate);

        return Result<IEnumerable<Guid>>.Success(response);
    }
}