using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using StudentHelper.Core.Interfaces;

namespace StudentHelper.Infrastructure.Services;

public class AIService : IAIService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _apiEndpoint;
    private readonly string _model;
    private readonly string _visionModel;    public AIService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["AI:ApiKey"] ?? throw new InvalidOperationException("AI API Key not configured");
        _apiEndpoint = configuration["AI:Endpoint"] ?? "https://generativelanguage.googleapis.com/v1";
        _model = configuration["AI:Model"] ?? "gemini-2.5-flash";
        _visionModel = configuration["AI:VisionModel"] ?? "gemini-2.5-flash";
    }    public async Task<string> AnalyzeImageAsync(Stream imageStream, string? context = null, string language = "ar")
    {
        Console.WriteLine($"[AIService] AnalyzeImageAsync called - Language: {language}");
        
        // Convert image to base64
        using var memoryStream = new MemoryStream();
        await imageStream.CopyToAsync(memoryStream);
        var imageBase64 = Convert.ToBase64String(memoryStream.ToArray());
        Console.WriteLine($"[AIService] Image converted to base64 (length: {imageBase64.Length})");

        // Language-specific prompts with structured format
        var defaultPrompt = language == "ar" 
            ? @"قم بتحليل هذه المسألة الرياضية وقدم الحل بالتنسيق التالي (استخدم هذا التنسيق بالضبط):

📝 المسألة
[اكتب نص المسألة هنا بوضوح]

🎯 الحل النهائي
[الإجابة المختصرة والنهائية]

📚 الخطوات التفصيلية
1. **الخطوة الأولى**: [شرح واضح ومفصل]
2. **الخطوة الثانية**: [شرح واضح ومفصل]
3. **الخطوة الثالثة**: [شرح واضح ومفصل]
[أضف خطوات إضافية حسب الحاجة]

✅ التحقق من الحل
[طريقة للتحقق من صحة الحل]

💡 ملاحظات مهمة
[نصائح أو معلومات إضافية مفيدة]

تأكد من استخدام الرموز التعبيرية (📝🎯📚✅💡) بالضبط كما هو موضح." 
            : @"Analyze this math problem and provide the solution in the following format (use this format exactly):

📝 The Problem
[Write the problem clearly here]

🎯 Final Answer
[Short, concise final answer]

📚 Detailed Steps
1. **First Step**: [Clear, detailed explanation]
2. **Second Step**: [Clear, detailed explanation]
3. **Third Step**: [Clear, detailed explanation]
[Add more steps as needed]

✅ Verification
[Method to verify the solution is correct]

💡 Key Notes
[Tips or additional helpful information]

Make sure to use the emojis (📝🎯📚✅💡) exactly as shown.";

        // Google Gemini API format
        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new object[]
                    {
                        new { text = context ?? defaultPrompt },
                        new 
                        { 
                            inline_data = new 
                            { 
                                mime_type = "image/jpeg",
                                data = imageBase64 
                            } 
                        }
                    }
                }
            }
        };        // Google AI Studio requires API key as URL query parameter, NOT Bearer token
        var url = $"{_apiEndpoint}/models/{_visionModel}:generateContent?key={_apiKey}";
        Console.WriteLine($"[AIService] Making request to: {_apiEndpoint}/models/{_visionModel}:generateContent");
        
        // Retry logic with timeout for vision API
        const int maxRetries = 3;
        for (int attempt = 1; attempt <= maxRetries; attempt++)
        {
            try
            {
                Console.WriteLine($"[AIService] Vision API attempt {attempt}/{maxRetries}");
                
                var request = new HttpRequestMessage(HttpMethod.Post, url);
                request.Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

                Console.WriteLine("[AIService] Sending request to Gemini API...");
                
                // Set 30-second timeout
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(30));
                var response = await _httpClient.SendAsync(request, cts.Token);
                Console.WriteLine($"[AIService] Response status: {response.StatusCode}");
                
                // Read response for better error messages
                var responseJson = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"[AIService] Response received (length: {responseJson.Length})");
                
                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"[AIService] ERROR: {responseJson}");
                    
                    // Retry on server errors (5xx) or rate limiting (429)
                    if ((int)response.StatusCode >= 500 || response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                    {
                        if (attempt < maxRetries)
                        {
                            var delay = TimeSpan.FromSeconds(Math.Pow(2, attempt)); // Exponential backoff
                            Console.WriteLine($"[AIService] Retrying after {delay.TotalSeconds}s...");
                            await Task.Delay(delay);
                            continue;
                        }
                    }
                    
                    throw new HttpRequestException($"Gemini API error ({response.StatusCode}): {responseJson}");
                }

                var result = JsonSerializer.Deserialize<JsonElement>(responseJson);
                
                // Extract text from Gemini response
                if (result.TryGetProperty("candidates", out var candidates) && candidates.GetArrayLength() > 0)
                {
                    var candidate = candidates[0];
                    if (candidate.TryGetProperty("content", out var contentObj) && 
                        contentObj.TryGetProperty("parts", out var parts) && parts.GetArrayLength() > 0)
                    {
                        Console.WriteLine($"[AIService] Vision API success on attempt {attempt}");
                        return parts[0].GetProperty("text").GetString() ?? "No response";
                    }
                }
                
                return "No response from AI";
            }
            catch (TaskCanceledException)
            {
                Console.WriteLine($"[AIService] Vision API timed out on attempt {attempt}");
                if (attempt == maxRetries)
                {
                    throw new TimeoutException("Image analysis timed out after 30 seconds. Please try with a smaller image.");
                }
                
                await Task.Delay(1000);
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"[AIService] HTTP error on attempt {attempt}: {ex.Message}");
                if (attempt == maxRetries)
                {
                    throw;
                }
                
                await Task.Delay(2000);
            }
        }
        
        throw new Exception("Failed to analyze image after multiple attempts");
    }    public async Task<string> GenerateExplanationAsync(string question, string answer, string language = "ar")
    {
        var prompt = language == "ar"
            ? $"أنت مدرس رياضيات مفيد. اشرح كيفية حل هذه المسألة: {question}\nالإجابة هي: {answer}\nقدم شرحاً واضحاً خطوة بخطوة باللغة العربية."
            : $"You are a helpful math tutor. Explain how to solve this problem: {question}\nThe answer is: {answer}\nProvide clear, step-by-step explanations in English.";
        return await SendGeminiRequestAsync(prompt);
    }

    public async Task<string> GenerateStepByStepSolutionAsync(string question, string language = "ar")
    {
        var prompt = language == "ar"
            ? $"أنت مدرس رياضيات مفيد. قدم حلاً تفصيلياً خطوة بخطوة لهذه المسألة: {question}\nقسّم المسألة إلى خطوات واضحة ومرقمة باللغة العربية."
            : $"You are a helpful math tutor. Provide a step-by-step solution for: {question}\nBreak down the problem into clear, numbered steps in English.";
        return await SendGeminiRequestAsync(prompt);
    }

    public async Task<string> ChatWithAIAsync(string message, List<string> conversationHistory, string language = "ar")
    {
        // Build conversation context for Gemini
        var contextBuilder = new StringBuilder();
        contextBuilder.AppendLine(language == "ar" 
            ? "أنت مساعد ذكاء اصطناعي مفيد للطلاب. كن مشجعاً وتعليمياً. أجب دائماً باللغة العربية." 
            : "You are a helpful AI tutor for students. Be encouraging and educational. Always respond in English.");
        
        if (conversationHistory.Any())
        {
            contextBuilder.AppendLine(language == "ar" ? "\nسجل المحادثة:" : "\nConversation history:");
            for (int i = 0; i < conversationHistory.Count; i++)
            {
                var speaker = i % 2 == 0 ? (language == "ar" ? "الطالب" : "Student") : (language == "ar" ? "المدرس" : "Tutor");
                contextBuilder.AppendLine($"{speaker}: {conversationHistory[i]}");
            }
        }
        
        var studentLabel = language == "ar" ? "الطالب" : "Student";
        var tutorLabel = language == "ar" ? "المدرس" : "Tutor";
        contextBuilder.AppendLine($"\n{studentLabel}: {message}");
        contextBuilder.AppendLine($"{tutorLabel}:");

        return await SendGeminiRequestAsync(contextBuilder.ToString());
    }

    public async Task<string> GetStudyAdviceAsync(string studentProfile, string language = "ar")
    {
        var prompt = language == "ar"
            ? $"أنت مستشار تعليمي. بناءً على هذا الملف الشخصي للطالب، قدم نصائح دراسية مخصصة:\n{studentProfile}\n\nقدم توصيات محددة وقابلة للتنفيذ باللغة العربية."
            : $"You are an educational advisor. Based on this student profile, provide personalized study advice:\n{studentProfile}\n\nProvide specific, actionable recommendations in English.";
        return await SendGeminiRequestAsync(prompt);
    }    public async Task<List<string>> GenerateFlashcardsAsync(string topic, int count = 5, string language = "ar")
    {
        var prompt = language == "ar"
            ? $"أنشئ بالضبط {count} بطاقات تعليمية عن: {topic}\n\nالصيغة كمصفوفة JSON: [{{\"question\": \"...\", \"answer\": \"...\"}}, ...]\nأرجع مصفوفة JSON فقط بدون نص إضافي. استخدم اللغة العربية للأسئلة والأجوبة."
            : $"Generate exactly {count} flashcards about: {topic}\n\nFormat as JSON array: [{{\"question\": \"...\", \"answer\": \"...\"}}, ...]\nReturn ONLY the JSON array, no other text. Use English for questions and answers.";
        
        var response = await SendGeminiRequestAsync(prompt);
        
        // Try to extract JSON from response
        try
        {
            // Remove markdown code blocks if present
            var jsonText = response.Trim();
            if (jsonText.StartsWith("```json"))
            {
                jsonText = jsonText.Substring(7);
            }
            if (jsonText.StartsWith("```"))
            {
                jsonText = jsonText.Substring(3);
            }
            if (jsonText.EndsWith("```"))
            {
                jsonText = jsonText.Substring(0, jsonText.Length - 3);
            }
            jsonText = jsonText.Trim();

            var flashcards = JsonSerializer.Deserialize<List<string>>(jsonText);
            return flashcards ?? new List<string>();
        }
        catch
        {
            // If parsing fails, return the raw response
            return new List<string> { response };
        }
    }

    private async Task<string> SendGeminiRequestAsync(string prompt, int maxRetries = 3)
    {
        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            }
        };

        // Google AI Studio requires API key as URL query parameter, NOT Bearer token
        var url = $"{_apiEndpoint}/models/{_model}:generateContent?key={_apiKey}";
        
        for (int attempt = 1; attempt <= maxRetries; attempt++)
        {
            try
            {
                Console.WriteLine($"[AIService] Attempt {attempt}/{maxRetries}");
                
                var request = new HttpRequestMessage(HttpMethod.Post, url);
                request.Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

                // Set 30-second timeout
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(30));
                var response = await _httpClient.SendAsync(request, cts.Token);
                
                // Read response for better error messages
                var responseJson = await response.Content.ReadAsStringAsync();
                
                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"[AIService] API error: {response.StatusCode}");
                    
                    // Retry on server errors (5xx) or rate limiting (429)
                    if ((int)response.StatusCode >= 500 || response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                    {
                        if (attempt < maxRetries)
                        {
                            var delay = TimeSpan.FromSeconds(Math.Pow(2, attempt)); // Exponential backoff: 2s, 4s, 8s
                            Console.WriteLine($"[AIService] Retrying after {delay.TotalSeconds}s...");
                            await Task.Delay(delay);
                            continue;
                        }
                    }
                    
                    throw new HttpRequestException($"Gemini API error ({response.StatusCode}): {responseJson}");
                }

                var result = JsonSerializer.Deserialize<JsonElement>(responseJson);
                
                // Extract text from Gemini response
                if (result.TryGetProperty("candidates", out var candidates) && candidates.GetArrayLength() > 0)
                {
                    var candidate = candidates[0];
                    if (candidate.TryGetProperty("content", out var contentObj) && 
                        contentObj.TryGetProperty("parts", out var parts) && parts.GetArrayLength() > 0)
                    {
                        Console.WriteLine($"[AIService] Success on attempt {attempt}");
                        return parts[0].GetProperty("text").GetString() ?? "No response";
                    }
                }
                
                return "No response from AI";
            }
            catch (TaskCanceledException)
            {
                Console.WriteLine($"[AIService] Request timed out on attempt {attempt}");
                if (attempt == maxRetries)
                {
                    throw new TimeoutException("AI request timed out after 30 seconds. Please try again.");
                }
                
                // Brief delay before retry
                await Task.Delay(1000);
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"[AIService] HTTP error on attempt {attempt}: {ex.Message}");
                if (attempt == maxRetries)
                {
                    throw;
                }
                
                // Brief delay before retry
                await Task.Delay(2000);
            }
        }
        
        throw new Exception("Failed to get response after multiple attempts");
    }
}
