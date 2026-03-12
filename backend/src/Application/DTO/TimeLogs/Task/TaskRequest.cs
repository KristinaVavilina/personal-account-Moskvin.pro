using Domain.Enums;

namespace Application.DTO.TimeLogs.Task;

public class TaskRequest
{
    public Guid UserId { get; set; }

    public string? TypeId { get; set; }

    public required string Title { get; set; }

    public string? Description { get; set; }

    public TaskProgress CurrentProgress { get; set; }
}