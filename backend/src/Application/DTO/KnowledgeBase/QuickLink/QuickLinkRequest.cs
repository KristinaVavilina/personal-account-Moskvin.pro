namespace Application.DTO.KnowledgeBase.QuickLink;

public class QuickLinkRequest
{
    public Guid? UserId { get; set; }

    public Guid KbItemId { get; set; }
}