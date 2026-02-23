using Domain.Enums.KnowledgeBase;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Models.KnowledgeBase;

public class KnowledgeBaseItem
{
    [Key]
    public Guid Id { get; set; }

    public Guid? ParentId { get; set; }

    [ForeignKey(nameof(ParentId))]
    public KnowledgeBaseItem? Parent { get; set; }

    public required ItemType Type { get; set; }

    public required string Title { get; set; }

    public string? Content { get; set; }

    public bool IsArchived { get; set; }

    public DateTime? ArchivedAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}