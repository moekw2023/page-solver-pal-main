namespace StudentHelper.Core.Models;

public class StudySession
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public int Duration { get; set; } // in seconds
    public string Subject { get; set; } = string.Empty;
    public int ProblemsCompleted { get; set; }
    public int CorrectAnswers { get; set; }
    public string? Notes { get; set; }

    // Navigation property
    public virtual User User { get; set; } = null!;
}
