using Domain.Enums;

namespace Application.DTO.KnowledgeBase.KBItem;

public class KBItemRequest
{
    public Guid? ParentId { get; set; }

    public required ItemType Type { get; set; }

    public required string Title { get; set; }

    public string? Content { get; set; }
}