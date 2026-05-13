namespace Domain.Models.Render;

public class RenderJob
{
    public Guid Id { get; set; }

    public string? ExternalJobId { get; set; }

    public string? Status { get; set; }

    public DateTime CreatedAt { get; set; }
}