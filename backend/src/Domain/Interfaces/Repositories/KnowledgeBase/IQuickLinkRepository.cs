using Domain.Models.KnowledgeBase;

namespace Domain.Interfaces.Repositories.KnowledgeBase;

public interface IQuickLinkRepository : IRepository<QuickLink, Guid>
{
    Task<IEnumerable<QuickLink>> GetQuickLinksByUserIdAsync(Guid userId);
}