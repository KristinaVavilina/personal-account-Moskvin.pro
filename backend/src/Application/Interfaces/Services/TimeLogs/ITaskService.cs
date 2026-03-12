using Applicatiion.Interfaces.Services;
using Application.DTO.TimeLogs.Task;
using Domain.Errors;

namespace Application.Interfaces.Services.TimeLogs;

public interface ITaskService
    : IService<TaskRequest, TaskResponse, Guid>
{
    Task<Result<IEnumerable<TaskResponse>>> GetUserTasksAsync(Guid userId, bool isArchived);

    Task<Result<int>> GetCompletedTasksCountAsync(Guid userId, DateTime startDate, DateTime endDate);
}