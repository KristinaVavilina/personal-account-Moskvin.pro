using Application.DTO.KnowledgeBase.KBItem;
using Application.Interfaces.Services.KnowledgeBase;
using AutoMapper;
using Domain.Errors;
using Domain.Interfaces.Repositories.KnowledgeBase;
using Domain.Models.KnowledgeBase;
using Serilog;

namespace Application.Services.KnowledgeBase;

public class KbService(IKbRepository repository, IMapper mapper)
    : BaseService<KnowledgeBaseItem, KBItemRequest, KBItemResponse, Guid>(repository, mapper), IKbService
{
    public async Task<Result<IEnumerable<KBItemResponse>>> GetTreeItemsAsync(bool isArchived)
    {
        var entities = await repository.GetTreeItemsAsync(isArchived);
        var response = _mapper.Map<IEnumerable<KBItemResponse>>(entities);
        var count = response.Count();

        if (count == 0)
        {
            Log.Warning("Записей в базе знаний не найдены (Архив: {IsArchived})", count, isArchived);
        }
        else
        {
            Log.Information("Получено {Count} записей из базы знаний (Архив: {IsArchived})", count, isArchived);
        }

        return Result<IEnumerable<KBItemResponse>>.Success(response);
    }

    public async Task<Result<IEnumerable<KBItemResponse>>> GetActiveChildrenByParentIdAsync(Guid? parentId)
    {
        var entities = await repository.GetActiveChildrenByParentIdAsync(parentId);
        var response = _mapper.Map<IEnumerable<KBItemResponse>>(entities);
        var count = response.Count();

        Log.Information("Получено {count} активных дочерних элементов для родителя {ParentId}", count, parentId);

        return Result<IEnumerable<KBItemResponse>>.Success(response);
    }
}