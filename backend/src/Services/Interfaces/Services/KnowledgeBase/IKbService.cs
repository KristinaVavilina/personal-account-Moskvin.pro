using Applicatiion.Interfaces.Services;
using Application.DTO.KnowledgeBase.KBItem;

namespace Application.Interfaces.Services.KnowledgeBase;

public interface IKbService
    : IService<KBItemRequest, KBItemResponse, Guid>
{
    Task<IEnumerable<KBItemResponse>> GetTreeItemsAsync(bool isArchived);

    Task<IEnumerable<KBItemResponse>> GetActiveChildrenByParentIdAsync(Guid? parentId);
}