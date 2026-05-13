namespace Application.DTO.System;

public class SystemSettingRequest
{
    public required string Id { get; set; }

    public string? Value { get; set; }

    public string? Description { get; set; }
}