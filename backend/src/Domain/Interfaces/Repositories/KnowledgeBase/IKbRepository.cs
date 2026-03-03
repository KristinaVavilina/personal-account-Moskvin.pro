using Domain.Models.KnowledgeBase;

namespace Domain.Interfaces.Repositories.KnowledgeBase;

public interface IKbRepository : IRepository<KnowledgeBaseItem, Guid>
{
    Task<IEnumerable<KnowledgeBaseItem>> GetTreeItemsAsync(bool isArchived);

    Task<IEnumerable<KnowledgeBaseItem>> GetActiveChildrenByParentIdAsync(Guid? parentId);
}