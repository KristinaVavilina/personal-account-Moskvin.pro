namespace Domain.Interfaces.Repositories.TimeLogs;

public interface ITaskRepository : IRepository<Models.TimeLogs.Task, Guid>
{
    Task<IEnumerable<Models.TimeLogs.Task>> GetUserTasksAsync(Guid userId, bool isArchived);

    Task<int> GetCompletedTasksCountAsync(Guid userId, DateTime startDate, DateTime endDate);
}