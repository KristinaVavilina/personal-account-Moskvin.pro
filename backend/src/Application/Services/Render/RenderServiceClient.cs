using Application.DTO.Render;
using System.Net.Http.Json;

namespace Application.Services.Render;

public class RenderServiceClient(HttpClient httpClient)
{
    public async Task<string> StartExternalRenderAsync(Guid taskId, object settings)
    {
        var jobId = Guid.NewGuid().ToString();
        return jobId;

        /*var response = await httpClient.PostAsJsonAsync("/api/external/render/start", new { taskId, settings });
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<ExternalRenderResponse>();
        return result!.RenderJobId;*/
    }

    public async Task<RenderStatusDto> GetExternalStatusAsync(string externalJobId)
    {
        return await httpClient.GetFromJsonAsync<RenderStatusDto>($"/api/external/render/status/{externalJobId}");
    }
}