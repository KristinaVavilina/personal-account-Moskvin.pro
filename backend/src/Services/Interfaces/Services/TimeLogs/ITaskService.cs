using Applicatiion.Interfaces.Services;
using Application.DTO.TimeLogs.Task;

namespace Application.Interfaces.Services.TimeLogs;

public interface ITaskService
    : IService<TaskRequest, TaskResponse, Guid>
{
    Task<IEnumerable<TaskResponse>> GetUserTasksAsync(Guid userId, bool isArchived);

    Task<int> GetCompletedTasksCountAsync(Guid userId, DateTime startDate, DateTime endDate);
}