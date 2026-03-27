using Applicatiion.Interfaces.Services;
using Application.DTO.TimeLogs.TaskType;

namespace Application.Interfaces.Services.TimeLogs;

public interface ITaskTypeService
    : IService<TaskTypeRequest, TaskTypeResponse, int>
{
}