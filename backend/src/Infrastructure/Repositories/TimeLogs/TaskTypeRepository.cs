using Domain.Interfaces.Repositories.TimeLogs;
using Domain.Models.TimeLogs;
using Infrastructure.Data;

namespace Infrastructure.Repositories.TimeLogs;

public class TaskTypeRepository(AppDbContext context)
    : BaseRepository<TaskType, int>(context), ITaskTypeRepository
{
}