using Domain.Interfaces.Repositories.System;
using Domain.Models.System;
using Infrastructure.Data;

namespace Infrastructure.Repositories.System;

public class SystemRepository(AppDbContext context)
    : BaseRepository<SystemSetting, string>(context), ISystemRepository
{
}