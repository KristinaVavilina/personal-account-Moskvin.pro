using Applicatiion.Interfaces.Services;
using Application.DTO.System;

namespace Application.Interfaces.Services.System;

public interface ISystemService
    : IService<SystemSettingRequest, SystemSettingResponse, string>
{
}