using Applicatiion.Interfaces.Services;
using Application.DTO.TimeLogs.DailyReflection;

namespace Application.Interfaces.Services.TimeLogs;

public interface IDailyReflectionService
    : IService<DailyReflectionRequest, DailyReflectionResponse, Guid>
{
}