namespace StudentHelper.Core.Interfaces;

public interface IAIService
{
    Task<string> AnalyzeImageAsync(Stream imageStream, string? context = null);
    Task<string> GenerateExplanationAsync(string question, string answer);
    Task<string> GenerateStepByStepSolutionAsync(string question);
    Task<string> ChatWithAIAsync(string message, List<string> conversationHistory);
    Task<string> GetStudyAdviceAsync(string studentProfile);
    Task<List<string>> GenerateFlashcardsAsync(string topic, int count = 5);
}
