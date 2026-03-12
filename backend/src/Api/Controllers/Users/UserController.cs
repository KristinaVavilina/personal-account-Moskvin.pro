using Application.DTO.Users.User;
using Application.Interfaces.Services.Users;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.Users;

public class UserController(IUserService service)
    : BaseController<IUserService, UserRequest, UserResponse, Guid>(service)
{
    [HttpGet("{archive}")]
    public async Task<IActionResult> GetByArchiveStatus([FromQuery] bool isArchived = false)
    {
        return HandleResult(await _service.GetByArchiveStatusAsync(isArchived));
    }
}