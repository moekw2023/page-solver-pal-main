using StudentHelper.Core.Models;

namespace StudentHelper.Core.Interfaces;

public interface IHistoryService
{
    Task<HistoryItem> AddHistoryItemAsync(HistoryItem item);
    Task<List<HistoryItem>> GetUserHistoryAsync(int userId, int pageSize = 20, int page = 1);
    Task<HistoryItem?> GetHistoryItemByIdAsync(int id);
    Task<bool> DeleteHistoryItemAsync(int id);
    Task<Dictionary<string, int>> GetSubjectStatisticsAsync(int userId);
}

public interface IAchievementService
{
    Task<List<Achievement>> GetUserAchievementsAsync(int userId);
    Task CheckAndUnlockAchievementsAsync(int userId);
    Task<Achievement?> UnlockAchievementAsync(int userId, string achievementId);
    Task UpdateAchievementProgressAsync(int userId, string achievementId, int progress);
}

public interface IDailyChallengeService
{
    Task<DailyChallenge> GetTodaysChallengeAsync();
    Task<ChallengeAttempt> SubmitChallengeAttemptAsync(int userId, int challengeId, string answer);
    Task<List<ChallengeAttempt>> GetUserAttemptsAsync(int userId);
    Task<int> GetUserStreakAsync(int userId);
}

public interface IStudySessionService
{
    Task<StudySession> StartSessionAsync(int userId, string subject);
    Task<StudySession> EndSessionAsync(int sessionId);
    Task<List<StudySession>> GetUserSessionsAsync(int userId, DateTime? fromDate = null);
    Task<Dictionary<string, object>> GetStudyStatisticsAsync(int userId);
}

public interface IFlashcardService
{
    Task<Flashcard> CreateFlashcardAsync(Flashcard flashcard);
    Task<List<Flashcard>> GetUserFlashcardsAsync(int userId, string? subject = null);
    Task<Flashcard> ReviewFlashcardAsync(int flashcardId, bool wasCorrect);
    Task<bool> DeleteFlashcardAsync(int flashcardId);
}

public interface IStudyGroupService
{
    Task<StudyGroup> CreateGroupAsync(StudyGroup group);
    Task<List<StudyGroup>> GetUserGroupsAsync(int userId);
    Task<bool> JoinGroupAsync(int groupId, int userId);
    Task<bool> LeaveGroupAsync(int groupId, int userId);
    Task<GroupMessage> SendMessageAsync(int groupId, int userId, string message);
    Task<List<GroupMessage>> GetGroupMessagesAsync(int groupId, int count = 50);
}
