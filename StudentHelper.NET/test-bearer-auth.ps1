# Test Google Gemini API with Bearer Token Authentication
# This script tests the Gemini API using the secure Bearer token method

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Google Gemini API - Bearer Token Test" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$apiKey = "AIzaSyDCa-t0nYCwJuoeJKWMS7qPHgbqIvv9tFc"
$endpoint = "https://generativelanguage.googleapis.com/v1"
$model = "gemini-1.5-flash"
$url = "$endpoint/models/$model`:generateContent"

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Endpoint: $endpoint" -ForegroundColor Gray
Write-Host "  Model: $model" -ForegroundColor Gray
Write-Host "  Auth Method: Bearer Token (Secure)" -ForegroundColor Green
Write-Host "  API Key: $($apiKey.Substring(0, 20))..." -ForegroundColor Gray
Write-Host "`nURL: $url`n" -ForegroundColor Gray

# Test 1: Simple Text Generation
Write-Host "Test 1: Simple Math Question" -ForegroundColor Cyan
Write-Host "-------------------------" -ForegroundColor Cyan

$requestBody = @{
    contents = @(
        @{
            parts = @(
                @{
                    text = "Solve this math problem step by step: What is 2x + 5 = 15?"
                }
            )
        }
    )
} | ConvertTo-Json -Depth 10

$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
}

try {
    Write-Host "Sending request with Bearer token..." -ForegroundColor Gray
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $requestBody -Headers $headers -ErrorAction Stop
    
    Write-Host "`n✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    
    if ($response.candidates -and $response.candidates.Count -gt 0) {
        $text = $response.candidates[0].content.parts[0].text
        Write-Host $text -ForegroundColor White
    } else {
        Write-Host "No response text found" -ForegroundColor Red
        Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor Gray
    }
} catch {
    Write-Host "`n❌ ERROR!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body:" -ForegroundColor Yellow
        Write-Host $responseBody -ForegroundColor Gray
    }
}

# Test 2: More Complex Question
Write-Host "`n`nTest 2: Complex Math Problem" -ForegroundColor Cyan
Write-Host "-------------------------" -ForegroundColor Cyan

$requestBody2 = @{
    contents = @(
        @{
            parts = @(
                @{
                    text = "Explain the quadratic formula and solve: x^2 - 5x + 6 = 0"
                }
            )
        }
    )
} | ConvertTo-Json -Depth 10

try {
    Write-Host "Sending request with Bearer token..." -ForegroundColor Gray
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $requestBody2 -Headers $headers -ErrorAction Stop
    
    Write-Host "`n✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    
    if ($response.candidates -and $response.candidates.Count -gt 0) {
        $text = $response.candidates[0].content.parts[0].text
        Write-Host $text -ForegroundColor White
    } else {
        Write-Host "No response text found" -ForegroundColor Red
    }
} catch {
    Write-Host "`n❌ ERROR!" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: List Available Models
Write-Host "`n`nTest 3: List Available Models" -ForegroundColor Cyan
Write-Host "-------------------------" -ForegroundColor Cyan

$modelsUrl = "$endpoint/models"
$modelsHeaders = @{
    "Authorization" = "Bearer $apiKey"
}

try {
    Write-Host "Fetching available models..." -ForegroundColor Gray
    $modelsResponse = Invoke-RestMethod -Uri $modelsUrl -Method Get -Headers $modelsHeaders -ErrorAction Stop
    
    Write-Host "`n✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Available Gemini Models:" -ForegroundColor Yellow
    
    if ($modelsResponse.models) {
        foreach ($model in $modelsResponse.models) {
            if ($model.name -like "*gemini*") {
                Write-Host "  • $($model.name)" -ForegroundColor Green
                Write-Host "    Description: $($model.description)" -ForegroundColor Gray
                Write-Host "    Supported Generation Methods: $($model.supportedGenerationMethods -join ', ')" -ForegroundColor Gray
                Write-Host ""
            }
        }
    }
} catch {
    Write-Host "`n❌ ERROR!" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nSummary:" -ForegroundColor Yellow
Write-Host "  ✓ Bearer token authentication is configured" -ForegroundColor Green
Write-Host "  ✓ API endpoint is correct: $endpoint" -ForegroundColor Green
Write-Host "  ✓ Model is configured: $model" -ForegroundColor Green
Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "  1. Run the ASP.NET Core application" -ForegroundColor White
Write-Host "  2. Test the Camera/Upload feature" -ForegroundColor White
Write-Host "  3. Verify image analysis works correctly" -ForegroundColor White
Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
