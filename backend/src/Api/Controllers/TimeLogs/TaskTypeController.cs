using Application.DTO.TimeLogs.TaskType;
using Application.Interfaces.Services.TimeLogs;

namespace Api.Controllers.TimeLogs;

public class TaskTypeController(ITaskTypeService service)
    : BaseController<ITaskTypeService, TaskTypeRequest, TaskTypeResponse, int>(service)
{
}