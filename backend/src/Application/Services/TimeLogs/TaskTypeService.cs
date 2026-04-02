using Application.DTO.TimeLogs.TaskType;
using Application.Interfaces.Services.TimeLogs;
using AutoMapper;
using Domain.Interfaces.Repositories.TimeLogs;
using Domain.Models.TimeLogs;

namespace Application.Services.TimeLogs;

public class TaskTypeService(ITaskTypeRepository repository, IMapper mapper)
    : BaseService<TaskType, TaskTypeRequest, TaskTypeResponse, int>(repository, mapper), ITaskTypeService
{
}