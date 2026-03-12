using Application.DTO.System;
using Application.Interfaces.Services.System;
using AutoMapper;
using Domain.Interfaces.Repositories.System;
using Domain.Models.System;

namespace Application.Services.System;

public class SystemService(ISystemRepository repository, IMapper mapper)
    : BaseService<SystemSetting, SystemSettingRequest, SystemSettingResponse, string>(repository, mapper), ISystemService
{
}