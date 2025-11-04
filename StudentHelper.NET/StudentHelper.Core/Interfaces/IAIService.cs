namespace StudentHelper.Core.Interfaces;

public interface IAIService
{
    Task<string> AnalyzeImageAsync(Stream imageStream, string? context = null, string language = "ar");
    Task<string> GenerateExplanationAsync(string question, string answer, string language = "ar");
    Task<string> GenerateStepByStepSolutionAsync(string question, string language = "ar");
    Task<string> ChatWithAIAsync(string message, List<string> conversationHistory, string language = "ar");
    Task<string> GetStudyAdviceAsync(string studentProfile, string language = "ar");
    Task<List<string>> GenerateFlashcardsAsync(string topic, int count = 5, string language = "ar");
}
