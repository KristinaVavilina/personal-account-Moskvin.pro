using Application.DTO.TimeLogs.Task;
using Application.Interfaces.Services.TimeLogs;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.TimeLogs;

public class TaskController(ITaskService service)
    : BaseController<ITaskService, TaskRequest, TaskResponse, Guid>(service)
{
    [HttpGet("user/{userId:guid}")]
    public async Task<IActionResult> GetUserTasks(Guid userId, [FromQuery] bool isArchived = false)
    {
        return HandleResult(await _service.GetUserTasksAsync(userId, isArchived));
    }

    [HttpGet("user/{userId:guid}/completed-count")]
    public async Task<IActionResult> GetCompletedCount(Guid userId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        return HandleResult(await _service.GetCompletedTasksCountAsync(userId, startDate, endDate));
    }
}