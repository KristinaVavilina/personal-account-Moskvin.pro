using Applicatiion.Interfaces.Services;
using Application.DTO.KnowledgeBase.QuickLink;

namespace Application.Interfaces.Services.KnowledgeBase;

public interface IQuickLinkService
    : IService<QuickLinkRequest, QuickLinkResponse, Guid>
{
    Task<IEnumerable<QuickLinkResponse>> GetQuickLinksByUserId(Guid userId);
}