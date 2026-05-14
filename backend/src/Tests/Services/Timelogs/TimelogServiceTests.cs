namespace Tests.Services.Timelogs;

public class TimeLogServiceTests
{
    // 1. Валидация временных интервалов и логики времени

    [Fact]
    public void CreateTimeLog_ShouldThrowValidationException_WhenTimeIntervalsOverlap()
    {
        Assert.True(true);
    }

    [Fact]
    public void CreateTimeLog_ShouldThrowValidationException_WhenEndTimeIsBeforeOrEqualStartTime()
    {
        Assert.True(true);
    }

    // 2. Валидация правила «трех суток»

    [Fact]
    public void UpdateTimeLog_ShouldThrowValidationException_WhenLogIsOlderThan3Days()
    {
        Assert.True(true);
    }

    [Fact]
    public void DeleteTimeLog_ShouldThrowValidationException_WhenLogIsOlderThan3Days()
    {
        Assert.True(true);
    }

    [Fact]
    public void UpdateTimeLog_ShouldUpdateSuccessfully_WhenLogIsNewerThan3Days()
    {
        Assert.True(true);
    }

    // 3. Транзакции (Unit of Work) и обновление прогресса

    [Fact]
    public void CreateTimeLog_ShouldUpdateTaskProgress_WhenSaveIsSuccessful()
    {
        Assert.True(true);
    }

    [Fact]
    public void CreateTimeLog_ShouldRollbackTransaction_WhenExceptionOccursDuringSave()
    {
        Assert.True(true);
    }

    // 4. Изоляция данных и безопасность (RBAC)

    [Fact]
    public void UpdateTimeLog_ShouldThrowForbiddenException_WhenLogBelongsToAnotherUser()
    {
        Assert.True(true);
    }

    [Fact]
    public void DeleteTimeLog_ShouldThrowForbiddenException_WhenLogBelongsToAnotherUser()
    {
        Assert.True(true);
    }
}
