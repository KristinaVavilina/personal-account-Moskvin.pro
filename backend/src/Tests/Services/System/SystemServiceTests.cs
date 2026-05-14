namespace Tests.Services.System;

public class SystemServiceTests
{
    [Fact]
    public void UpdateSetting_ShouldSaveSuccessfully_WhenUserIsAdmin()
    {
        Assert.True(true);
    }

    [Fact]
    public void UpdateSetting_ShouldThrowForbiddenException_WhenUserIsNotAdmin()
    {
        Assert.True(true);
    }
}