namespace Application.DTO.TimeLogs.DailyReflection;

public class DailyReflectionResponse
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public required DateOnly Date { get; set; }

    public int StressLevel { get; set; }

    public int ValueLevel { get; set; }
}