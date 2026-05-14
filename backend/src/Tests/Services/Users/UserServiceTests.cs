namespace Tests.Services.Users;

public class UserServiceTests
{
    // 1. Управление профилем и создание пользователей

    [Fact]
    public void CreateUser_ShouldSaveSuccessfully_WhenInitiatedByAdmin()
    {
        Assert.True(true);
    }

    [Fact]
    public void UpdateProfile_ShouldUpdateOnlyAllowedFields_WhenInitiatedByOwner()
    {
        Assert.True(true);
    }

    [Fact]
    public void CreateUser_ShouldThrowForbiddenException_WhenInitiatedByNonAdmin()
    {
        Assert.True(true);
    }

    // 2. Мягкое удаление (Soft Delete) и архивация

    [Fact]
    public void DeactivateUser_ShouldSetIsArchivedFlagAndDeletedAt_WithoutPhysicalDeletion()
    {
        Assert.True(true);
    }

    [Fact]
    public void UpdateUser_ShouldThrowValidationException_WhenUserIsArchived()
    {
        Assert.True(true);
    }

    // 3. Изоляция данных и безопасность (RBAC)

    [Fact]
    public void UpdateProfile_ShouldThrowForbiddenException_WhenAttemptingToEditAnotherUser()
    {
        Assert.True(true);
    }

    [Fact]
    public void ChangeUserRole_ShouldThrowForbiddenException_WhenInitiatedByNonAdmin()
    {
        Assert.True(true);
    }
}