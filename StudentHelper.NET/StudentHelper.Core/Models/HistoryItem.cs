namespace StudentHelper.Core.Models;

public class HistoryItem
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Question { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string Subject { get; set; } = string.Empty;
    public string Difficulty { get; set; } = "medium";
    public int TimeSpent { get; set; } // in seconds
    public bool IsCorrect { get; set; }
    public string? Steps { get; set; } // JSON array of solution steps

    // Navigation property
    public virtual User User { get; set; } = null!;
}
