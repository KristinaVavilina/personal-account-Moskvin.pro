using Application.DTO.Render;
using Application.Interfaces.Services.Render;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.Render;

[ApiController]
[Route("api/render")]
public class RenderController : ControllerBase
{
    private readonly IRenderService _renderService;

    public RenderController(IRenderService renderService)
    {
        _renderService = renderService;
    }

    [HttpPost("start/{taskId}")]
    public async Task<IActionResult> Start(Guid taskId, [FromBody] RenderSettingsDto settings)
    {
        var result = await _renderService.StartRenderAsync(taskId, settings);

        if (result.IsSuccess) return Ok(result);
        else return BadRequest(result);
    }

    [HttpGet("status/{taskId}")]
    public async Task<IActionResult> GetStatus(Guid taskId)
    {
        var result = await _renderService.GetStatusByTaskIdAsync(taskId);

        if (result.IsSuccess) return Ok(result);
        else return BadRequest(result);
    }
}
