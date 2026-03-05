using Applicatiion.Interfaces.Services;
using Application.DTO.KnowledgeBase.KBItem;
using Domain.Errors;

namespace Application.Interfaces.Services.KnowledgeBase;

public interface IKbService
    : IService<KBItemRequest, KBItemResponse, Guid>
{
    Task<Result<IEnumerable<KBItemResponse>>> GetTreeItemsAsync(bool isArchived);

    Task<Result<IEnumerable<KBItemResponse>>> GetActiveChildrenByParentIdAsync(Guid? parentId);
}