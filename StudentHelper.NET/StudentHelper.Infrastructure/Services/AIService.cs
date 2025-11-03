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
    }public async Task<string> AnalyzeImageAsync(Stream imageStream, string? context = null)
    {
        // Convert image to base64
        using var memoryStream = new MemoryStream();
        await imageStream.CopyToAsync(memoryStream);
        var imageBase64 = Convert.ToBase64String(memoryStream.ToArray());

        // Google Gemini API format
        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new object[]
                    {
                        new { text = context ?? "Analyze this math problem and provide a detailed solution with step-by-step explanation." },
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
        var request = new HttpRequestMessage(HttpMethod.Post, url);
        request.Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

        var response = await _httpClient.SendAsync(request);
        
        // Read response for better error messages
        var responseJson = await response.Content.ReadAsStringAsync();
        
        if (!response.IsSuccessStatusCode)
        {
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
                return parts[0].GetProperty("text").GetString() ?? "No response";
            }
        }
        
        return "No response from AI";
    }    public async Task<string> GenerateExplanationAsync(string question, string answer)
    {
        var prompt = $"You are a helpful math tutor. Explain how to solve this problem: {question}\nThe answer is: {answer}\nProvide clear, step-by-step explanations.";
        return await SendGeminiRequestAsync(prompt);
    }

    public async Task<string> GenerateStepByStepSolutionAsync(string question)
    {
        var prompt = $"You are a helpful math tutor. Provide a step-by-step solution for: {question}\nBreak down the problem into clear, numbered steps.";
        return await SendGeminiRequestAsync(prompt);
    }

    public async Task<string> ChatWithAIAsync(string message, List<string> conversationHistory)
    {
        // Build conversation context for Gemini
        var contextBuilder = new StringBuilder();
        contextBuilder.AppendLine("You are a helpful AI tutor for students. Be encouraging and educational.");
        
        if (conversationHistory.Any())
        {
            contextBuilder.AppendLine("\nConversation history:");
            for (int i = 0; i < conversationHistory.Count; i++)
            {
                var speaker = i % 2 == 0 ? "Student" : "Tutor";
                contextBuilder.AppendLine($"{speaker}: {conversationHistory[i]}");
            }
        }
        
        contextBuilder.AppendLine($"\nStudent: {message}");
        contextBuilder.AppendLine("Tutor:");

        return await SendGeminiRequestAsync(contextBuilder.ToString());
    }

    public async Task<string> GetStudyAdviceAsync(string studentProfile)
    {
        var prompt = $"You are an educational advisor. Based on this student profile, provide personalized study advice:\n{studentProfile}\n\nProvide specific, actionable recommendations.";
        return await SendGeminiRequestAsync(prompt);
    }

    public async Task<List<string>> GenerateFlashcardsAsync(string topic, int count = 5)
    {
        var prompt = $"Generate exactly {count} flashcards about: {topic}\n\nFormat as JSON array: [{{\"question\": \"...\", \"answer\": \"...\"}}, ...]\nReturn ONLY the JSON array, no other text.";
        
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

    private async Task<string> SendGeminiRequestAsync(string prompt)
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
        };        // Google AI Studio requires API key as URL query parameter, NOT Bearer token
        var url = $"{_apiEndpoint}/models/{_model}:generateContent?key={_apiKey}";
        var request = new HttpRequestMessage(HttpMethod.Post, url);
        request.Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

        var response = await _httpClient.SendAsync(request);
        
        // Read response for better error messages
        var responseJson = await response.Content.ReadAsStringAsync();
        
        if (!response.IsSuccessStatusCode)
        {
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
                return parts[0].GetProperty("text").GetString() ?? "No response";
            }
        }
        
        return "No response from AI";
    }
}
