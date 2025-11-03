namespace StudentHelper.Core.Models;

public class Flashcard
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Question { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Difficulty { get; set; } = "medium";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastReviewedAt { get; set; } = DateTime.UtcNow;
    public int ReviewCount { get; set; }
    public int CorrectCount { get; set; }
    public bool IsMastered { get; set; }

    // Navigation property
    public virtual User User { get; set; } = null!;
}
