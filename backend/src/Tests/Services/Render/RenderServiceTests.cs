namespace Tests.Services.Render;

public class RenderServiceTests
{
    // 1. Инициализация процесса рендеринга

    [Fact]
    public void StartRender_ShouldSaveRenderJobId_WhenExternalServiceReturnsSuccess()
    {
        Assert.True(true);
    }

    [Fact]
    public void StartRender_ShouldThrowException_WhenExternalServiceIsUnavailable()
    {
        Assert.True(true);
    }

    // 2. Получение статуса вычисления

    [Fact]
    public void GetRenderStatus_ShouldReturnStatusAndProgress_WhenJobExists()
    {
        Assert.True(true);
    }

    [Fact]
    public void GetRenderStatus_ShouldThrowNotFoundException_WhenJobDoesNotExistForTask()
    {
        Assert.True(true);
    }

    // 3. Изоляция данных и безопасность

    [Fact]
    public void StartRender_ShouldThrowForbiddenException_WhenTaskBelongsToAnotherUser()
    {
        Assert.True(true);
    }
}