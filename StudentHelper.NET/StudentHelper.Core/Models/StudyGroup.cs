namespace StudentHelper.Core.Models;

public class StudyGroup
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public int CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public virtual User Creator { get; set; } = null!;
    public virtual ICollection<StudyGroupMember> Members { get; set; } = new List<StudyGroupMember>();
    public virtual ICollection<GroupMessage> Messages { get; set; } = new List<GroupMessage>();
}

public class StudyGroupMember
{
    public int Id { get; set; }
    public int GroupId { get; set; }
    public int UserId { get; set; }
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public bool IsAdmin { get; set; }

    // Navigation properties
    public virtual StudyGroup Group { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}

public class GroupMessage
{
    public int Id { get; set; }
    public int GroupId { get; set; }
    public int UserId { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual StudyGroup Group { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}
