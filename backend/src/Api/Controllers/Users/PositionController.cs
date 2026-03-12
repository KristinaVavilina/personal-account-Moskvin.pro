using Application.DTO.Users.Position;
using Application.Interfaces.Services.Users;

namespace Api.Controllers.Users;

public class PositionController(IPositionService service)
    : BaseController<IPositionService, PositionRequest, PositionResponse, int>(service)
{
}