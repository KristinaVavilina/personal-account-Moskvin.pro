namespace Application.DTO.TimeLogs.DailyReflection;

public class DailyReflectionRequest
{
    public Guid UserId { get; set; }

    public required DateOnly Date { get; set; }

    public int StressLevel { get; set; }

    public int ValueLevel { get; set; }
}