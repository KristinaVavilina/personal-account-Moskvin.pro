using Domain.Interfaces.Repositories.KnowledgeBase;
using Domain.Models.KnowledgeBase;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories.KnowledgeBase;

public class QuickLinkRepository(AppDbContext context)
    : BaseRepository<QuickLink, Guid>(context), IQuickLinkRepository
{
    public async Task<IEnumerable<QuickLink>> GetQuickLinksByUserIdAsync(Guid userId)
    {
        return await _dbSet
            .Where(x => x.UserId == userId || x.UserId == null)
            .OrderBy(x => x.UserId)
            .ToListAsync();
    }
}