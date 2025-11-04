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
    }    [HttpPost]
    public async Task<IActionResult> AnalyzeImage(IFormFile image, string? context, string language = "ar")
    {
        Console.WriteLine($"[CameraController] AnalyzeImage called - Language: {language}");
        
        if (image == null || image.Length == 0)
        {
            Console.WriteLine("[CameraController] No image provided");
            return Json(new { 
                success = false, 
                error = (language == "ar" ? "لم يتم توفير صورة" : "No image provided"),
                errorType = "validation"
            });
        }

        // Validate file size (max 10MB)
        const long maxFileSize = 10 * 1024 * 1024; // 10MB
        if (image.Length > maxFileSize)
        {
            Console.WriteLine($"[CameraController] File too large: {image.Length} bytes");
            return Json(new { 
                success = false, 
                error = language == "ar" 
                    ? "حجم الصورة كبير جداً. الحد الأقصى المسموح به هو 10 ميجابايت." 
                    : "Image is too large. Maximum allowed size is 10MB.",
                errorType = "file_size"
            });
        }

        // Validate file type
        var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" };
        var contentType = image.ContentType.ToLower();
        if (!allowedTypes.Contains(contentType))
        {
            Console.WriteLine($"[CameraController] Invalid file type: {contentType}");
            return Json(new { 
                success = false, 
                error = language == "ar" 
                    ? "نوع الملف غير مدعوم. يرجى رفع صورة بصيغة JPG، PNG، GIF، أو WebP." 
                    : "Unsupported file type. Please upload a JPG, PNG, GIF, or WebP image.",
                errorType = "file_type"
            });
        }

        // Basic security check - verify file signature
        using (var memStream = new MemoryStream())
        {
            await image.CopyToAsync(memStream);
            memStream.Position = 0;
            
            var buffer = new byte[8];
            await memStream.ReadAsync(buffer, 0, 8);
            memStream.Position = 0;
            
            // Check for common image file signatures
            bool isValidImage = 
                (buffer[0] == 0xFF && buffer[1] == 0xD8 && buffer[2] == 0xFF) || // JPEG
                (buffer[0] == 0x89 && buffer[1] == 0x50 && buffer[2] == 0x4E && buffer[3] == 0x47) || // PNG
                (buffer[0] == 0x47 && buffer[1] == 0x49 && buffer[2] == 0x46) || // GIF
                (buffer[0] == 0x52 && buffer[1] == 0x49 && buffer[2] == 0x46 && buffer[3] == 0x46); // WebP/RIFF
            
            if (!isValidImage)
            {
                Console.WriteLine("[CameraController] Invalid image file signature");
                return Json(new { 
                    success = false, 
                    error = language == "ar" 
                        ? "الملف المرفوع لا يبدو أنه صورة صالحة." 
                        : "The uploaded file does not appear to be a valid image.",
                    errorType = "invalid_file"
                });
            }
        }

        Console.WriteLine($"[CameraController] Image validated: {image.FileName}, Size: {image.Length} bytes, Type: {contentType}");

        try
        {
            // Store language preference
            HttpContext.Session.SetString("Language", language);

            Console.WriteLine("[CameraController] Calling AI service...");
            using var stream = image.OpenReadStream();
            var result = await _aiService.AnalyzeImageAsync(stream, context, language);
            Console.WriteLine($"[CameraController] AI service returned result (length: {result?.Length ?? 0})");

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
            await _context.SaveChangesAsync();            Console.WriteLine($"[CameraController] Success! History ID: {historyItem.Id}");
            return Json(new { success = true, result = result, historyId = historyItem.Id });
        }
        catch (TimeoutException ex)
        {
            Console.WriteLine($"[CameraController] TIMEOUT: {ex.Message}");
            return Json(new { 
                success = false, 
                error = language == "ar" 
                    ? "انتهت مهلة الطلب. الصورة قد تكون كبيرة جداً. يرجى المحاولة مرة أخرى بصورة أصغر حجماً." 
                    : "Request timed out. The image may be too large. Please try again with a smaller image.",
                errorType = "timeout"
            });
        }
        catch (HttpRequestException ex)
        {
            Console.WriteLine($"[CameraController] HTTP ERROR: {ex.Message}");
            
            if (ex.Message.Contains("429") || ex.Message.Contains("TooManyRequests"))
            {
                return Json(new { 
                    success = false, 
                    error = language == "ar" 
                        ? "تم تجاوز الحد المسموح من الطلبات. يرجى الانتظار دقيقة واحدة والمحاولة مرة أخرى." 
                        : "Rate limit exceeded. Please wait one minute and try again.",
                    errorType = "rate_limit"
                });
            }
            
            return Json(new { 
                success = false, 
                error = language == "ar" 
                    ? "خطأ في الاتصال بخدمة الذكاء الاصطناعي. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى." 
                    : "Error connecting to AI service. Please check your internet connection and try again.",
                errorType = "connection"
            });
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("API Key"))
        {
            Console.WriteLine($"[CameraController] API KEY ERROR: {ex.Message}");
            return Json(new { 
                success = false, 
                error = language == "ar" 
                    ? "خطأ في إعدادات الخادم. يرجى الاتصال بالدعم الفني." 
                    : "Server configuration error. Please contact support.",
                errorType = "config"
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[CameraController] ERROR: {ex.Message}");
            Console.WriteLine($"[CameraController] Stack trace: {ex.StackTrace}");
            return Json(new { 
                success = false, 
                error = language == "ar" 
                    ? "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى." 
                    : "An unexpected error occurred. Please try again.",
                errorType = "unknown",
                details = ex.Message
            });
        }
    }[HttpPost]
    public async Task<IActionResult> GenerateSteps(string question, string language = "ar")
    {
        if (string.IsNullOrEmpty(question))
        {
            return BadRequest(language == "ar" ? "لم يتم توفير سؤال" : "No question provided");
        }

        try
        {
            var steps = await _aiService.GenerateStepByStepSolutionAsync(question, language);
            return Json(new { success = true, steps = steps });
        }
        catch (Exception ex)
        {
            return Json(new { success = false, error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> SetLanguage(string language)
    {
        HttpContext.Session.SetString("Language", language);
        return Json(new { success = true, language = language });
    }
}

