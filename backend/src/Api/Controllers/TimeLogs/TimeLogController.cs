using Application.DTO.TimeLogs.TimeLog;
using Application.Interfaces.Services.TimeLogs;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.TimeLogs;

public class TimeLogController(ITimeLogService service)
    : BaseController<ITimeLogService, TimeLogRequest, TimeLogResponse, Guid>(service)
{
    [HttpGet("user/{userId:guid}")]
    public async Task<IActionResult> GetTimeLogs(Guid userId, [FromQuery] DateOnly startDate, [FromQuery] DateOnly endDate)
    {
        return HandleResult(await _service.GetTimeLogsAsync(userId, startDate, endDate));
    }

    [HttpGet("user/{userId:guid}/tasks")]
    public async Task<IActionResult> GetTaskIdList(Guid userId, [FromQuery] DateOnly startDate, [FromQuery] DateOnly endDate)
    {
        return HandleResult(await _service.GetTaskIdListAsync(userId, startDate, endDate));
    }
}