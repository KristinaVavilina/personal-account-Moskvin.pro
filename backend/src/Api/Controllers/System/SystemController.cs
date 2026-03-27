using Application.DTO.System;
using Application.Interfaces.Services.System;

namespace Api.Controllers.System;

public class SystemController(ISystemService service)
    : BaseController<ISystemService, SystemSettingRequest, SystemSettingResponse, string>(service)
{
}