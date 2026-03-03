using Domain.Interfaces.Repositories.KnowledgeBase;
using Domain.Models.KnowledgeBase;
using Infrastructure.Data;

namespace Infrastructure.Repositories.KnowledgeBase;

public class QuickLinkRepository(AppDbContext context)
    : BaseRepository<QuickLink, Guid>(context), IQuickLinkRepository
{
}