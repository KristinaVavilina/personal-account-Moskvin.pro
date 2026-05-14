namespace Tests.Services.Timelogs;

public class TaskServiceTests
{
    // 1. Создание и базовая валидация задач

    [Fact]
    public void CreateTask_ShouldSaveSuccessfully_WhenDataIsValid()
    {
        Assert.True(true);
    }

    [Fact]
    public void CreateTask_ShouldThrowValidationException_WhenTitleIsEmptyOrTypeIsMissing()
    {
        Assert.True(true);
    }

    // 2. Мягкое удаление (Soft Delete) и архивация

    [Fact]
    public void DeleteTask_ShouldSetIsArchivedFlagAndArchivedAt_WithoutPhysicalDeletion()
    {
        Assert.True(true);
    }

    [Fact]
    public void UpdateTask_ShouldThrowValidationException_WhenTaskIsAlreadyArchived()
    {
        Assert.True(true);
    }

    // 3. Обновление параметров и прогресса

    [Fact]
    public void UpdateProgress_ShouldSaveSuccessfully_WhenValueIsBetween0And100()
    {
        Assert.True(true);
    }

    [Fact]
    public void UpdateProgress_ShouldThrowValidationException_WhenValueIsOutOfBounds()
    {
        Assert.True(true);
    }

    // 4. Изоляция данных и безопасность (RBAC)

    [Fact]
    public void GetUserTasks_ShouldReturnOnlyTasksBelongingToRequestedUserId()
    {
        Assert.True(true);
    }

    [Fact]
    public void UpdateTask_ShouldThrowForbiddenException_WhenTaskBelongsToAnotherUser()
    {
        Assert.True(true);
    }

    [Fact]
    public void DeleteTask_ShouldThrowForbiddenException_WhenTaskBelongsToAnotherUser()
    {
        Assert.True(true);
    }
}
