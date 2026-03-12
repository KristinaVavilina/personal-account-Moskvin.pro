using Application.DTO.KnowledgeBase.KBItem;
using Application.Interfaces.Services.KnowledgeBase;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.KnowledgeBase;

public class KbController(IKbService service)
    : BaseController<IKbService, KBItemRequest, KBItemResponse, Guid>(service)
{
    [HttpGet("tree")]
    public async Task<IActionResult> GetTreeItems([FromQuery] bool isArchived)
    {
        return HandleResult(await _service.GetTreeItemsAsync(isArchived));
    }

    [HttpGet("children/{parentId:guid?}")]
    public async Task<IActionResult> GetActiveChildrenByParentId(Guid? parentId)
    {
        return HandleResult(await _service.GetActiveChildrenByParentIdAsync(parentId));
    }
}