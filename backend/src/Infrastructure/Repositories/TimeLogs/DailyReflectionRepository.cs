using Domain.Interfaces.Repositories.TimeLogs;
using Domain.Models.TimeLogs;
using Infrastructure.Data;

namespace Infrastructure.Repositories.TimeLogs;

public class DailyReflectionRepository(AppDbContext context)
    : BaseRepository<DailyReflection, Guid> (context), IDailyReflectionRepository
{
}