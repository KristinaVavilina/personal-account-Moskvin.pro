namespace Application.DTO.TimeLogs.TimeLog;

internal class TimeLogRequest
{
    public Guid TaskId { get; set; }

    public Guid UserId { get; set; }

    public required DateOnly Date { get; set; }

    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }

    public int? ProgressSnapshot { get; set; }

    public string? Comment { get; set; }
}