using Applicatiion.Interfaces.Services;
using Domain.Errors;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseController<TService, TRequest, TResponse, TId> : ControllerBase
    where TService : IService<TRequest, TResponse, TId>
{
    protected readonly TService _service;

    protected BaseController(TService service)
    {
        _service = service;
    }

    [HttpGet("{id}")]
    public virtual async Task<IActionResult> GetById(TId id)
    {
        return HandleResult(await _service.GetByIdAsync(id));
    }

    [HttpGet]
    public virtual async Task<IActionResult> GetAll()
    {
        return HandleResult(await _service.GetAllAsync());
    }

    [HttpPost]
    public virtual async Task<IActionResult> Add([FromBody] TRequest request)
    {
        return HandleResult(await _service.AddAsync(request));
    }

    [HttpPut("{id}")]
    public virtual async Task<IActionResult> Update(TId id, [FromBody] TRequest request)
    {
        return HandleResult(await _service.UpdateAsync(id, request));
    }

    [HttpDelete("{id}")]
    public virtual async Task<IActionResult> Remove(TId id)
    {
        return HandleResult(await _service.RemoveAsync(id));
    }

    protected IActionResult HandleResult<T>(Result<T> result)
    {
        if (result == null) return NotFound();

        if (result.IsSuccess)
        {
            return result.Value is null ? NotFound() : Ok(result.Value);
        }

        return BadRequest(new { error = result.Error });
    }
}