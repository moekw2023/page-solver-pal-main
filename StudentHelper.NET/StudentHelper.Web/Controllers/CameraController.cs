using Microsoft.AspNetCore.Mvc;
using StudentHelper.Core.Interfaces;
using StudentHelper.Core.Models;
using StudentHelper.Infrastructure.Data;

namespace StudentHelper.Web.Controllers;

public class CameraController : Controller
{
    private readonly IAIService _aiService;
    private readonly ApplicationDbContext _context;

    public CameraController(IAIService aiService, ApplicationDbContext context)
    {
        _aiService = aiService;
        _context = context;
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
        {
            using var stream = image.OpenReadStream();
            var result = await _aiService.AnalyzeImageAsync(stream, context);

            // Save to history
            var userId = HttpContext.Session.GetInt32("UserId") ?? 1; // Default user for now
            var historyItem = new HistoryItem
            {
                UserId = userId,
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
