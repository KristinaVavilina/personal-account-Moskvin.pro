using System.ComponentModel.DataAnnotations;

namespace Domain.Models;

public class Position
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string? Title { get; set; }
}