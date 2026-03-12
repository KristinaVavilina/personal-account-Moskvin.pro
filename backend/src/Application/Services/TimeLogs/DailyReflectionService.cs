using Application.DTO.TimeLogs.DailyReflection;
using Application.Interfaces.Services.TimeLogs;
using AutoMapper;
using Domain.Interfaces.Repositories.TimeLogs;
using Domain.Models.TimeLogs;

namespace Application.Services.TimeLogs;

public class DailyReflectionService(IDailyReflectionRepository repository, IMapper mapper)
    : BaseService<DailyReflection, DailyReflectionRequest, DailyReflectionResponse, Guid>(repository, mapper), IDailyReflectionService
{
}