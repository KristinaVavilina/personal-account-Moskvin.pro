namespace Application.DTO.KnowledgeBase.QuickLink;

public class QuickLinkResponse
{
    public Guid Id { get; set; }

    public Guid? UserId { get; set; }

    public Guid KbItemId { get; set; }
}