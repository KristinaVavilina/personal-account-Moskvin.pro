using System.ComponentModel.DataAnnotations;

namespace Domain.Models.System;

public class SystemSetting
{
    [Key]
    public required string Id { get; set; }

    public string? Value { get; set; }

    public string? Description { get; set; }
}