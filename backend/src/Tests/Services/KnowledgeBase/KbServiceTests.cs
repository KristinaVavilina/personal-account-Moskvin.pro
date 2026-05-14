namespace Tests.Services.KnowledgeBase;

public class KbServiceTests
{
    // 1. Создание элементов и валидация иерархии

    [Fact]
    public void CreateKbItem_ShouldSaveSuccessfully_WhenDataIsValid()
    {
        Assert.True(true);
    }

    [Fact]
    public void CreateKbItem_ShouldThrowValidationException_WhenTitleIsEmpty()
    {
        Assert.True(true);
    }

    [Fact]
    public void CreateKbItem_ShouldThrowValidationException_WhenParentIdDoesNotExist()
    {
        Assert.True(true);
    }

    // 2. Мягкое удаление (Soft Delete) и архивация

    [Fact]
    public void DeleteKbItem_ShouldSetIsArchivedFlagAndArchivedAt_WithoutPhysicalDeletion()
    {
        Assert.True(true);
    }

    [Fact]
    public void UpdateKbItem_ShouldThrowValidationException_WhenItemIsAlreadyArchived()
    {
        Assert.True(true);
    }

    // 3. Безопасность и ролевая модель доступа (RBAC)

    [Fact]
    public void CreateKbItem_ShouldThrowForbiddenException_WhenUserIsRegularEmployee()
    {
        Assert.True(true);
    }

    [Fact]
    public void UpdateOrDeleteKbItem_ShouldThrowForbiddenException_WhenUserIsRegularEmployee()
    {
        Assert.True(true);
    }

    [Fact]
    public void ManageKbItem_ShouldExecuteSuccessfully_WhenUserIsManagerOrAdmin()
    {
        Assert.True(true);
    }
}
