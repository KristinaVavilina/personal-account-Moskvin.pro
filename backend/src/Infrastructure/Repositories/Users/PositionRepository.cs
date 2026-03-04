using Domain.Interfaces.Repositories.Users;
using Domain.Models.Users;
using Infrastructure.Data;

namespace Infrastructure.Repositories.Users;

public class PositionRepository(AppDbContext context)
    : BaseRepository<Position, int>(context), IPositionRepository
{
}