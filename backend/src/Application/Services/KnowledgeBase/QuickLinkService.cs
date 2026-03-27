using Application.DTO.KnowledgeBase.QuickLink;
using Application.Interfaces.Services.KnowledgeBase;
using AutoMapper;
using Domain.Errors;
using Domain.Interfaces.Repositories.KnowledgeBase;
using Domain.Models.KnowledgeBase;
using Serilog;

namespace Application.Services.KnowledgeBase;

public class QuickLinkService(IQuickLinkRepository repository, IMapper mapper)
    : BaseService<QuickLink, QuickLinkRequest, QuickLinkResponse, Guid>(repository, mapper), IQuickLinkService
{
    public async Task<Result<IEnumerable<QuickLinkResponse>>> GetQuickLinksByUserIdAsync(Guid userId)
    {
        var entities = await repository.GetQuickLinksByUserIdAsync(userId);
        var response = _mapper.Map<IEnumerable<QuickLinkResponse>>(entities);
        var count = response.Count();

        Log.Information("Получено {Count} быстрых ссылок пользователя {UserId}", count, userId);

        return Result<IEnumerable<QuickLinkResponse>>.Success(response);
    }
}