using Domain.Interfaces.Repositories.KnowledgeBase;
using Domain.Models.KnowledgeBase;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories.KnowledgeBase;

public class KbRepository(AppDbContext context)
    : BaseRepository<KnowledgeBaseItem, Guid>(context), IKbRepository
{
    public async Task<IEnumerable<KnowledgeBaseItem>> GetTreeItemsAsync(bool isArchived)
    {
        return await _dbSet
            .Where(x => x.IsArchived == isArchived)
            .OrderBy(x => x.Type)
            .ToListAsync();
    }

    public async Task<IEnumerable<KnowledgeBaseItem>> GetActiveChildrenByParentIdAsync(Guid? parentId)
    {
        return await _dbSet
            .Where(x => x.ParentId == parentId && !x.IsArchived)
            .OrderBy(x => x.Type)
            .ToListAsync();
    }
}