namespace Application.DTO.Render;

public class RenderSettingsDto
{
    public string Mode { get; set; } = string.Empty;
    public string OutputName { get; set; } = string.Empty;
    public int StartFrame { get; set; }
    public int EndFrame { get; set; }
    public int Fps { get; set; }
    public int Samples { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
    public string SavePath { get; set; } = string.Empty;
}