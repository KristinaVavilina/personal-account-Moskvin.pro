using Domain.Errors;

namespace Application.Interfaces.Services.Render;

public interface IRenderService
{
    public Task<Result<Guid>> StartRenderAsync(Guid taskId, object settings);

    public Task<Result<string>> GetStatusByTaskIdAsync(Guid taskId);
}