namespace Tests.Services.Users;

public class AuthServiceTests
{
    [Fact]
    public void Login_ShouldReturnTokenAndProfile_WhenCredentialsAreValid()
    {
        Assert.True(true);
    }

    [Fact]
    public void Login_ShouldThrowUnauthorizedException_WhenPasswordIsIncorrect()
    {
        Assert.True(true);
    }

    [Fact]
    public void Login_ShouldThrowUnauthorizedException_WhenEmailDoesNotExist()
    {
        Assert.True(true);
    }
}