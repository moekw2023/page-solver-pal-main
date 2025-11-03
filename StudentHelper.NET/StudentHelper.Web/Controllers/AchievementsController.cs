using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentHelper.Core.Models;
using StudentHelper.Infrastructure.Data;
using StudentHelper.Infrastructure.Services;

namespace StudentHelper.Web.Controllers;

public class AchievementsController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly IUserService _userService;

    public AchievementsController(ApplicationDbContext context, IUserService userService)
    {
        _context = context;
        _userService = userService;
    }    public async Task<IActionResult> Index()
    {
        var userId = HttpContext.Session.GetInt32("UserId");
        if (userId == null)
        {
            var user = await _userService.GetOrCreateDefaultUserAsync();
            userId = user.Id;
            HttpContext.Session.SetInt32("UserId", user.Id);
        }

        var userIdValue = userId.Value;
        
        var achievements = await _context.Achievements
            .Where(a => a.UserId == userIdValue)
            .OrderByDescending(a => a.IsUnlocked)
            .ThenBy(a => a.Rarity)
            .ToListAsync();

        // Calculate overall progress
        var totalAchievements = achievements.Count;
        var unlockedAchievements = achievements.Count(a => a.IsUnlocked);
        var progressPercentage = totalAchievements > 0 ? (unlockedAchievements * 100 / totalAchievements) : 0;

        ViewBag.ProgressPercentage = progressPercentage;
        ViewBag.UnlockedCount = unlockedAchievements;
        ViewBag.TotalCount = totalAchievements;

        return View(achievements);
    }    [HttpPost]
    public async Task<IActionResult> CheckAchievements()
    {
        var userId = HttpContext.Session.GetInt32("UserId");
        if (userId == null)
        {
            var user = await _userService.GetOrCreateDefaultUserAsync();
            userId = user.Id;
            HttpContext.Session.SetInt32("UserId", user.Id);
        }

        var userIdValue = userId.Value; // Extract value for queries
        
        // Get user statistics
        var problemsCount = await _context.HistoryItems.CountAsync(h => h.UserId == userIdValue);
        var correctAnswers = await _context.HistoryItems.CountAsync(h => h.UserId == userIdValue && h.IsCorrect);
        var studySessions = await _context.StudySessions.CountAsync(s => s.UserId == userIdValue);

        var newlyUnlocked = new List<Achievement>();        // Check "First Problem" achievement
        if (problemsCount >= 1)
        {
            var achievement = await GetOrCreateAchievement(userIdValue, "first_problem", "First Problem", "Solved your first problem!", "common");
            if (!achievement.IsUnlocked)
            {
                achievement.IsUnlocked = true;
                achievement.UnlockedAt = DateTime.UtcNow;
                newlyUnlocked.Add(achievement);
            }
        }

        // Check "Problem Solver" achievement (10 problems)
        if (problemsCount >= 10)
        {
            var achievement = await GetOrCreateAchievement(userIdValue, "problem_solver", "Problem Solver", "Solved 10 problems!", "rare");
            if (!achievement.IsUnlocked)
            {
                achievement.IsUnlocked = true;
                achievement.UnlockedAt = DateTime.UtcNow;
                newlyUnlocked.Add(achievement);
            }
        }

        // Check "Math Master" achievement (100 problems)
        if (problemsCount >= 100)
        {
            var achievement = await GetOrCreateAchievement(userIdValue, "math_master", "Math Master", "Solved 100 problems!", "epic");
            if (!achievement.IsUnlocked)
            {
                achievement.IsUnlocked = true;
                achievement.UnlockedAt = DateTime.UtcNow;
                newlyUnlocked.Add(achievement);
            }
        }

        // Check "Perfect Week" achievement (7 day streak)
        var lastWeekSessions = await _context.StudySessions
            .Where(s => s.UserId == userIdValue && s.StartTime >= DateTime.UtcNow.AddDays(-7))
            .Select(s => s.StartTime.Date)
            .Distinct()
            .CountAsync();

        if (lastWeekSessions >= 7)
        {
            var achievement = await GetOrCreateAchievement(userIdValue, "perfect_week", "Perfect Week", "Studied for 7 days straight!", "legendary");
            if (!achievement.IsUnlocked)
            {
                achievement.IsUnlocked = true;
                achievement.UnlockedAt = DateTime.UtcNow;
                newlyUnlocked.Add(achievement);
            }
        }

        await _context.SaveChangesAsync();

        return Json(new { success = true, newAchievements = newlyUnlocked });
    }

    private async Task<Achievement> GetOrCreateAchievement(int userId, string achievementId, string title, string description, string rarity)
    {
        var achievement = await _context.Achievements
            .FirstOrDefaultAsync(a => a.UserId == userId && a.AchievementId == achievementId);

        if (achievement == null)
        {
            achievement = new Achievement
            {
                UserId = userId,
                AchievementId = achievementId,
                Title = title,
                Description = description,
                Rarity = rarity,
                IsUnlocked = false,
                Progress = 0,
                MaxProgress = 1
            };
            _context.Achievements.Add(achievement);
        }

        return achievement;
    }
}
