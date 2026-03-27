using Application.DTO.TimeLogs.Task;
using Application.Interfaces.Services.TimeLogs;
using AutoMapper;
using Domain.Errors;
using Domain.Interfaces.Repositories.TimeLogs;
using Serilog;

namespace Application.Services.TimeLogs;

public class TaskService(ITaskRepository repository, IMapper mapper)
    : BaseService<Domain.Models.TimeLogs.Task, TaskRequest, TaskResponse, Guid>(repository, mapper), ITaskService
{
    public async Task<Result<IEnumerable<TaskResponse>>> GetUserTasksAsync(Guid userId, bool isArchived)
    {
        var entities = await repository.GetUserTasksAsync(userId, isArchived);
        var response = _mapper.Map<IEnumerable<TaskResponse>>(entities);
        var count = response.Count();

        if (count == 0)
        {
            Log.Warning("Задачи пользователя {UserId} не найдены (Архив: {IsArchived})", userId, isArchived);
        }
        else
        {
            Log.Information("Успешно получено {Count} задач пользователя {UserId} (Архив: {IsArchived})", count, userId, isArchived);
        }

        return Result<IEnumerable<TaskResponse>>.Success(response);
    }

    public async Task<Result<int>> GetCompletedTasksCountAsync(Guid userId, DateTime startDate, DateTime endDate)
    {
        var response = await repository.GetCompletedTasksCountAsync(userId, startDate, endDate);

        Log.Information("Пользователь {UserId} выполнил {Count} задач в период с {StartDate} по {EndDate}",
            userId, response, startDate, endDate);

        return Result<int>.Success(response);
    }
}