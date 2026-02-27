using Domain.Models.KnowledgeBase;

namespace Domain.Interfaces.KnowledgeBase;

public interface IKbRepository: IRepository<KnowledgeBaseItem, Guid>
{
    Task<IEnumerable<KnowledgeBaseItem>> GetTreeItemsAsync(bool isArchived);

    Task<IEnumerable<KnowledgeBaseItem>> GetChildrenByParentIdAsync(Guid? parentId);
}