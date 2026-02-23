using Domain.Models.Users;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Models.KnowledgeBase;

public class QuickLink
{
    [Key]
    public Guid Id { get; set; }

    public Guid? UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    public Guid KbItemId { get; set; }

    [ForeignKey(nameof(KbItemId))]
    public KnowledgeBaseItem? KbItem { get; set; }
}
