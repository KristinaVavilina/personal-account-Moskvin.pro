using Application.Interfaces.Services.Render;
using Domain.Models.Render;
using Domain.Errors;

namespace Application.Services.Render;

public class RenderService(RenderServiceClient client) : IRenderService
{
    public async Task<Result<Guid>> StartRenderAsync(Guid taskId, object settings)
    {
        var externalId = await client.StartExternalRenderAsync(taskId, settings);

        var job = new RenderJob { ExternalJobId = externalId };

        return Result<Guid>.Success(job.Id);
    }

    public async Task<Result<string>> GetStatusByTaskIdAsync(Guid taskId)
    {
        return Result<string>.Success("Ok");
    }
}