using System.ComponentModel.DataAnnotations;

namespace Domain.Models.TimeLogs;

public class TaskType
{
    [Key]
    public int Id { get; set; }

    public required string Name { get; set; }

    public required string Color { get; set; }
}
