using Application.DTO.KnowledgeBase.QuickLink;
using Application.Interfaces.Services.KnowledgeBase;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.KnowledgeBase;

public class QuickLinkController(IQuickLinkService service)
    : BaseController<IQuickLinkService, QuickLinkRequest, QuickLinkResponse, Guid>(service)
{
    [HttpGet("user/{userId:guid}")]
    public async Task<IActionResult> GetQuickLinkByUserId(Guid userId)
    {
        return HandleResult(await _service.GetQuickLinksByUserIdAsync(userId));
    }
}