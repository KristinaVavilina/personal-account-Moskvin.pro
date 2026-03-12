using Domain.Enums;

namespace Application.DTO.KnowledgeBase.KBItem;

public class KBItemResponse
{
    public Guid Id { get; set; }

    public Guid? ParentId { get; set; }

    public required ItemType Type { get; set; }

    public required string Title { get; set; }

    public string? Content { get; set; }
}