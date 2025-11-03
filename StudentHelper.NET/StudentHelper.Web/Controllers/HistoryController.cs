using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentHelper.Infrastructure.Data;

namespace StudentHelper.Web.Controllers;

public class HistoryController : Controller
{
    private readonly ApplicationDbContext _context;

    public HistoryController(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IActionResult> Index(int page = 1, int pageSize = 20)
    {
        var userId = HttpContext.Session.GetInt32("UserId") ?? 1;
        
        var totalItems = await _context.HistoryItems
            .Where(h => h.UserId == userId)
            .CountAsync();

        var items = await _context.HistoryItems
            .Where(h => h.UserId == userId)
            .OrderByDescending(h => h.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        ViewBag.CurrentPage = page;
        ViewBag.TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

        return View(items);
    }

    public async Task<IActionResult> Details(int id)
    {
        var item = await _context.HistoryItems.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        return View(item);
    }

    [HttpPost]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.HistoryItems.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        _context.HistoryItems.Remove(item);
        await _context.SaveChangesAsync();

        return RedirectToAction(nameof(Index));
    }

    [HttpGet]
    public async Task<IActionResult> Statistics()
    {
        var userId = HttpContext.Session.GetInt32("UserId") ?? 1;
        
        var stats = await _context.HistoryItems
            .Where(h => h.UserId == userId)
            .GroupBy(h => h.Subject)
            .Select(g => new
            {
                Subject = g.Key,
                Count = g.Count(),
                AverageTime = g.Average(h => h.TimeSpent),
                Accuracy = g.Average(h => h.IsCorrect ? 100.0 : 0.0)
            })
            .ToListAsync();

        return Json(stats);
    }
}
