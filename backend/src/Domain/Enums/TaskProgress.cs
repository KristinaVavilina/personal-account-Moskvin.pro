namespace Domain.Enums;

public enum TaskProgress
{
    NotStarted = 0,
    ResearchAndDrafting = 20,
    SkeletonReady = 40,
    Detailing = 60,
    TestingAndFixes = 70,
    ReviewAndFeedback = 90,
    Completed = 100
}