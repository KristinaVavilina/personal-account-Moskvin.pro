using System.ComponentModel.DataAnnotations;

namespace Domain.Models.Users;

public class Position
{
    [Key]
    public int Id { get; set; }

    public required string Title { get; set; }
}