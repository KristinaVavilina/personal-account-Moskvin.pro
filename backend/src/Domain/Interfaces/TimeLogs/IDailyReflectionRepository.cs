using Domain.Models.TimeLogs;

namespace Domain.Interfaces.TimeLogs;

public interface IDailyReflectionRepository: IRepository<DailyReflection, Guid>
{
}
