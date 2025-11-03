namespace StudentHelper.Core.Models;

public class Achievement
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string AchievementId { get; set; } = string.Empty; // e.g., "first_problem", "speed_demon"
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string Rarity { get; set; } = "common"; // common, rare, epic, legendary
    public bool IsUnlocked { get; set; }
    public DateTime? UnlockedAt { get; set; }
    public int Progress { get; set; }
    public int MaxProgress { get; set; }

    // Navigation property
    public virtual User User { get; set; } = null!;
}
