using Domain.Interfaces.Repositories;
using Domain.Models.System;

namespace Domain.Interfaces.Repositories.System;

public interface ISystemRepository : IRepository<SystemSetting, string>
{
}