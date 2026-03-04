using Domain.Models.Users;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Models.TimeLogs;

public class DailyReflection
{
    [Key]
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    public required DateOnly Date { get; set; }

    public int StressLevel { get; set; }

    public int ValueLevel { get; set; }
}