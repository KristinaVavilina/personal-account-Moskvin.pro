using Applicatiion.Interfaces.Services;
using Application.DTO.Users.Position;

namespace Application.Interfaces.Services.Users;

public interface IPositionService
    : IService<PositionRequest, PositionResponse, int>
{
}