namespace StudentHelper.Core.Models;

public class DailyChallenge
{
    public int Id { get; set; }
    public DateTime Date { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Question { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public string Difficulty { get; set; } = "medium"; // easy, medium, hard
    public int Points { get; set; }
    public string Subject { get; set; } = string.Empty;

    // Navigation properties
    public virtual ICollection<ChallengeAttempt> Attempts { get; set; } = new List<ChallengeAttempt>();
}

public class ChallengeAttempt
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int ChallengeId { get; set; }
    public string UserAnswer { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public DateTime AttemptedAt { get; set; } = DateTime.UtcNow;
    public int TimeSpent { get; set; } // in seconds

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual DailyChallenge Challenge { get; set; } = null!;
}
