using Application.DTO.TimeLogs.DailyReflection;
using Application.Interfaces.Services.TimeLogs;

namespace Api.Controllers.TimeLogs;

public class DailyReflectionController(IDailyReflectionService service)
    : BaseController<IDailyReflectionService, DailyReflectionRequest, DailyReflectionResponse, Guid>(service)
{
}