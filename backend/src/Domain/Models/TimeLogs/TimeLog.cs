using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Models.TimeLogs;

public class TimeLog
{
    [Key]
    public Guid Id { get; set; }

    public Guid TaskId { get; set; }

    [ForeignKey(nameof(TaskId))]
    public Task? Task { get; set; }

    public required DateOnly Date { get; set; }

    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }
    
    public int? ProgressSnapshot { get; set; }

    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; }
}