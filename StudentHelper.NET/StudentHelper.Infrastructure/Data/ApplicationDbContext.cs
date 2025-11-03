using Microsoft.EntityFrameworkCore;
using StudentHelper.Core.Models;

namespace StudentHelper.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<HistoryItem> HistoryItems { get; set; }
    public DbSet<Achievement> Achievements { get; set; }
    public DbSet<DailyChallenge> DailyChallenges { get; set; }
    public DbSet<ChallengeAttempt> ChallengeAttempts { get; set; }
    public DbSet<StudySession> StudySessions { get; set; }
    public DbSet<Flashcard> Flashcards { get; set; }
    public DbSet<StudyGroup> StudyGroups { get; set; }
    public DbSet<StudyGroupMember> StudyGroupMembers { get; set; }
    public DbSet<GroupMessage> GroupMessages { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Language).HasMaxLength(10);
            entity.Property(e => e.Theme).HasMaxLength(10);
        });

        // HistoryItem configuration
        modelBuilder.Entity<HistoryItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Question).IsRequired();
            entity.Property(e => e.Answer).IsRequired();
            entity.Property(e => e.Subject).HasMaxLength(50);
            entity.Property(e => e.Difficulty).HasMaxLength(20);
            entity.HasOne(e => e.User)
                .WithMany(u => u.HistoryItems)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.CreatedAt);
        });

        // Achievement configuration
        modelBuilder.Entity<Achievement>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.AchievementId).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Rarity).HasMaxLength(20);
            entity.HasOne(e => e.User)
                .WithMany(u => u.Achievements)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => new { e.UserId, e.AchievementId }).IsUnique();
        });

        // DailyChallenge configuration
        modelBuilder.Entity<DailyChallenge>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Difficulty).HasMaxLength(20);
            entity.HasIndex(e => e.Date).IsUnique();
        });

        // ChallengeAttempt configuration
        modelBuilder.Entity<ChallengeAttempt>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Challenge)
                .WithMany(c => c.Attempts)
                .HasForeignKey(e => e.ChallengeId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => new { e.UserId, e.ChallengeId });
        });

        // StudySession configuration
        modelBuilder.Entity<StudySession>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Subject).HasMaxLength(50);
            entity.HasOne(e => e.User)
                .WithMany(u => u.StudySessions)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.StartTime);
        });

        // Flashcard configuration
        modelBuilder.Entity<Flashcard>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Subject).HasMaxLength(50);
            entity.Property(e => e.Difficulty).HasMaxLength(20);
            entity.HasOne(e => e.User)
                .WithMany(u => u.Flashcards)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => e.UserId);
        });

        // StudyGroup configuration
        modelBuilder.Entity<StudyGroup>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Subject).HasMaxLength(50);
            entity.HasOne(e => e.Creator)
                .WithMany()
                .HasForeignKey(e => e.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // StudyGroupMember configuration
        modelBuilder.Entity<StudyGroupMember>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Group)
                .WithMany(g => g.Members)
                .HasForeignKey(e => e.GroupId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => new { e.GroupId, e.UserId }).IsUnique();
        });

        // GroupMessage configuration
        modelBuilder.Entity<GroupMessage>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Group)
                .WithMany(g => g.Messages)
                .HasForeignKey(e => e.GroupId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => e.GroupId);
            entity.HasIndex(e => e.SentAt);
        });
    }
}
