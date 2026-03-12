using Domain.Enums;

namespace Application.DTO.TimeLogs.Task;

public class TaskResponse
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string? TypeName { get; set; }

    public required string Title { get; set; }

    public string? Description { get; set; }

    public TaskProgress CurrentProgress { get; set; }
}