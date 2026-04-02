using Application.DTO.Users.Position;
using Application.Interfaces.Services.Users;
using AutoMapper;
using Domain.Interfaces.Repositories.Users;
using Domain.Models.Users;

namespace Application.Services.Users;

public class PositionService(IPositionRepository repository, IMapper mapper)
    : BaseService<Position, PositionRequest, PositionResponse, int>(repository, mapper), IPositionService
{
}