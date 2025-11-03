using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentHelper.Core.Interfaces;
using StudentHelper.Core.Models;
using StudentHelper.Infrastructure.Data;
using StudentHelper.Infrastructure.Services;

namespace StudentHelper.Web.Controllers;

public class CameraController : Controller
{
    private readonly IAIService _aiService;
    private readonly ApplicationDbContext _context;
    private readonly IUserService _userService;

    public CameraController(IAIService aiService, ApplicationDbContext context, IUserService userService)
    {
        _aiService = aiService;
        _context = context;
        _userService = userService;
    }

    public IActionResult Index()
    {
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> AnalyzeImage(IFormFile image, string? context)
    {
        if (image == null || image.Length == 0)
        {
            return BadRequest("No image provided");
        }

        try
        {            using var stream = image.OpenReadStream();
            var result = await _aiService.AnalyzeImageAsync(stream, context);

            // Get or create user
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                var user = await _userService.GetOrCreateDefaultUserAsync();
                userId = user.Id;
                HttpContext.Session.SetInt32("UserId", user.Id);
            }

            // Save to history
            var historyItem = new HistoryItem
            {
                UserId = userId.Value,
                Question = context ?? "Image analysis",
                Answer = result,
                CreatedAt = DateTime.UtcNow,
                Subject = "Math",
                Difficulty = "medium",
                TimeSpent = 0,
                IsCorrect = true
            };

            _context.HistoryItems.Add(historyItem);
            await _context.SaveChangesAsync();

            return Json(new { success = true, result = result, historyId = historyItem.Id });
        }
        catch (Exception ex)
        {
            return Json(new { success = false, error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> GenerateSteps(string question)
    {
        if (string.IsNullOrEmpty(question))
        {
            return BadRequest("No question provided");
        }

        try
        {
            var steps = await _aiService.GenerateStepByStepSolutionAsync(question);
            return Json(new { success = true, steps = steps });
        }
        catch (Exception ex)
        {
            return Json(new { success = false, error = ex.Message });
        }
    }
}
