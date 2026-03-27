using Applicatiion.Interfaces.Services;
using Application.DTO.KnowledgeBase.QuickLink;
using Domain.Errors;

namespace Application.Interfaces.Services.KnowledgeBase;

public interface IQuickLinkService
    : IService<QuickLinkRequest, QuickLinkResponse, Guid>
{
    Task<Result<IEnumerable<QuickLinkResponse>>> GetQuickLinksByUserIdAsync(Guid userId);
}