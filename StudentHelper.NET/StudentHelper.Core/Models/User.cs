namespace StudentHelper.Core.Models;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Language { get; set; } = "en";
    public string Theme { get; set; } = "light";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastLoginAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<HistoryItem> HistoryItems { get; set; } = new List<HistoryItem>();
    public virtual ICollection<Achievement> Achievements { get; set; } = new List<Achievement>();
    public virtual ICollection<StudySession> StudySessions { get; set; } = new List<StudySession>();
    public virtual ICollection<Flashcard> Flashcards { get; set; } = new List<Flashcard>();
}
