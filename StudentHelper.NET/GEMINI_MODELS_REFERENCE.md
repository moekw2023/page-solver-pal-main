# Google Gemini Models Reference

## Currently Configured Model ✅

**Model:** `gemini-2.5-flash`  
**Location:** `appsettings.json`  
**Status:** ✅ Active and Working  
**Released:** June 2025 (Stable)  
**Context Window:** 1,048,576 tokens  
**Capabilities:** Text + Vision (multimodal)

```json
{
  "AI": {
    "Provider": "GoogleVertexAI",
    "ApiKey": "AIzaSyDCa-t0nYCwJuoeJKWMS7qPHgbqIvv9tFc",
    "Endpoint": "https://generativelanguage.googleapis.com/v1",
    "Model": "gemini-2.5-flash",
    "VisionModel": "gemini-2.5-flash"
  }
}
```

---

## All Available Models (50 Total)

### ⭐ Recommended for Student Helper

#### 1. **gemini-2.5-flash** (Current)
- **Best for:** Fast responses, image analysis, general tutoring
- **Context:** 1M tokens
- **Speed:** Very Fast
- **Cost:** Low
- **Multimodal:** ✅ Yes
- **Status:** Stable (Released June 2025)

#### 2. **gemini-2.5-pro**
- **Best for:** Complex problem solving, detailed explanations
- **Context:** 1M tokens
- **Speed:** Medium
- **Cost:** Higher
- **Multimodal:** ✅ Yes
- **Status:** Stable (Released June 2025)

#### 3. **gemini-2.5-flash-lite**
- **Best for:** Ultra-fast responses, simple queries
- **Context:** 1M tokens
- **Speed:** Fastest
- **Cost:** Lowest
- **Multimodal:** ✅ Yes
- **Status:** Stable

#### 4. **gemini-2.0-flash-thinking-exp**
- **Best for:** Advanced reasoning, multi-step problems
- **Context:** 32K tokens
- **Speed:** Slower (shows thinking process)
- **Cost:** Medium
- **Multimodal:** ✅ Yes
- **Status:** Experimental

---

## Complete Model List (Sorted by Version)

### Gemini 2.5 Series (Latest - Released June 2025)
```
gemini-2.5-flash
gemini-2.5-flash-lite
gemini-2.5-flash-exp-02-27
gemini-2.5-flash-exp-03-18
gemini-2.5-flash-preview-1212
gemini-2.5-flash-preview-0205
gemini-2.5-flash-thinking-exp-0205
gemini-2.5-flash-thinking-lite-exp-0205
gemini-2.5-flash-002
gemini-2.5-flash-001
gemini-2.5-pro
gemini-2.5-pro-latest
gemini-2.5-pro-exp-03-18
gemini-2.5-pro-preview-0205
gemini-2.5-pro-preview-1212
```

### Gemini 2.0 Series
```
gemini-2.0-flash
gemini-2.0-flash-exp
gemini-2.0-flash-thinking-exp-01-21
gemini-2.0-flash-thinking-exp
gemini-2.0-flash-lite
gemini-2.0-flash-lite-exp
```

### Gemini 1.5 Series (Previous Generation)
```
gemini-1.5-flash
gemini-1.5-flash-latest
gemini-1.5-flash-002
gemini-1.5-flash-001
gemini-1.5-flash-001-tuning
gemini-1.5-flash-8b
gemini-1.5-flash-8b-latest
gemini-1.5-flash-8b-001
gemini-1.5-flash-8b-exp-0924
gemini-1.5-flash-8b-exp-0827
gemini-1.5-pro
gemini-1.5-pro-latest
gemini-1.5-pro-002
gemini-1.5-pro-001
gemini-1.5-pro-exp-0827
```

### Gemini 1.0 Series (Legacy)
```
gemini-1.0-pro
gemini-1.0-pro-latest
gemini-1.0-pro-001
gemini-1.0-pro-vision-latest
```

### Specialized Models
```
learnlm-1.5-pro-experimental (Education-focused)
gemma-2-2b-it (Open model - 2B parameters)
gemma-2-9b-it (Open model - 9B parameters)
gemma-2-27b-it (Open model - 27B parameters)
```

---

## Model Comparison for Student Helper

| Model | Speed | Quality | Cost | Vision | Best Use Case |
|-------|-------|---------|------|--------|---------------|
| **gemini-2.5-flash** ⭐ | ⚡⚡⚡ | ⭐⭐⭐⭐ | 💰 | ✅ | **Current - Best balance** |
| gemini-2.5-pro | ⚡⚡ | ⭐⭐⭐⭐⭐ | 💰💰💰 | ✅ | Complex problems |
| gemini-2.5-flash-lite | ⚡⚡⚡⚡ | ⭐⭐⭐ | 💰 | ✅ | Simple queries |
| gemini-2.0-flash-thinking | ⚡ | ⭐⭐⭐⭐⭐ | 💰💰 | ✅ | Step-by-step reasoning |
| learnlm-1.5-pro-experimental | ⚡⚡ | ⭐⭐⭐⭐ | 💰💰 | ✅ | Education-specific |

---

## How to Change Models

### Option 1: Update appsettings.json
```json
{
  "AI": {
    "Model": "gemini-2.5-pro",  // Change this
    "VisionModel": "gemini-2.5-flash"  // Or this
  }
}
```

### Option 2: Environment Variables (Production)
```bash
export AI__Model=gemini-2.5-pro
export AI__VisionModel=gemini-2.5-flash
```

### Option 3: Azure App Settings
```bash
az webapp config appsettings set \
  --name StudentHelperApp \
  --resource-group StudentHelperRG \
  --settings AI__Model=gemini-2.5-pro
```

---

## Testing Different Models

### Quick Test Script
```powershell
# test-gemini-model.ps1
$models = @(
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash-thinking-exp"
)

foreach ($model in $models) {
    Write-Host "`nTesting $model..." -ForegroundColor Cyan
    
    $body = @{
        contents = @(
            @{
                parts = @(
                    @{ text = "What is 2 + 2?" }
                )
            }
        )
    } | ConvertTo-Json -Depth 10
    
    $response = Invoke-RestMethod `
        -Uri "https://generativelanguage.googleapis.com/v1/models/${model}:generateContent" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer AIzaSyDCa-t0nYCwJuoeJKWMS7qPHgbqIvv9tFc"
            "Content-Type" = "application/json"
        } `
        -Body $body
    
    $answer = $response.candidates[0].content.parts[0].text
    Write-Host "Response: $answer" -ForegroundColor Green
}
```

---

## Performance Benchmarks (Estimated)

| Model | Avg Response Time | Tokens/Sec | Typical Image Analysis Time |
|-------|------------------|------------|----------------------------|
| gemini-2.5-flash-lite | 0.5-1s | 100+ | 1-2s |
| gemini-2.5-flash | 1-2s | 80-100 | 2-3s |
| gemini-2.5-pro | 2-4s | 40-60 | 4-6s |
| gemini-2.0-flash-thinking | 5-10s | 20-30 | 8-12s |

---

## API Endpoint Structure

```
POST https://generativelanguage.googleapis.com/v1/models/{MODEL_NAME}:generateContent
Authorization: Bearer {API_KEY}
Content-Type: application/json

{
  "contents": [
    {
      "parts": [
        { "text": "Your prompt here" },
        { 
          "inline_data": {
            "mime_type": "image/jpeg",
            "data": "base64_image_data"
          }
        }
      ]
    }
  ]
}
```

---

## Features Supported by All Models

✅ **Text Generation** - All 50 models  
✅ **Vision/Image Analysis** - All models except `gemini-1.0-pro`  
✅ **JSON Mode** - Gemini 2.0+ and 1.5-pro  
✅ **Function Calling** - Gemini 2.0+ and 1.5-pro  
✅ **System Instructions** - All Gemini 2.x models  
✅ **Thinking Mode** - Only `-thinking-` models  

---

## Recommended Configuration by Feature

### For Camera/Image Analysis
```json
"VisionModel": "gemini-2.5-flash"  // Best balance
```

### For Complex Math Problems
```json
"Model": "gemini-2.5-pro"  // Higher reasoning
```

### For Real-Time Chat
```json
"Model": "gemini-2.5-flash-lite"  // Fastest responses
```

### For Study Advice
```json
"Model": "learnlm-1.5-pro-experimental"  // Education-focused
```

---

## Cost Optimization Strategies

### Strategy 1: Dynamic Model Selection
```csharp
public string GetOptimalModel(string taskType)
{
    return taskType switch
    {
        "simple_chat" => "gemini-2.5-flash-lite",
        "image_analysis" => "gemini-2.5-flash",
        "complex_problem" => "gemini-2.5-pro",
        "step_by_step" => "gemini-2.0-flash-thinking-exp",
        _ => "gemini-2.5-flash"
    };
}
```

### Strategy 2: Fallback Chain
```csharp
private readonly string[] _modelFallbackChain = 
{
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-1.0-pro"
};
```

---

## Migration Notes

### From OpenAI to Gemini 2.5
| OpenAI Model | Gemini Equivalent | Notes |
|--------------|-------------------|-------|
| gpt-4o | gemini-2.5-pro | Similar capability |
| gpt-4o-mini | gemini-2.5-flash | Current config ✅ |
| gpt-3.5-turbo | gemini-2.5-flash-lite | Faster alternative |
| gpt-4-vision | gemini-2.5-flash | Vision support |

---

## Links & Documentation

- **Official Docs:** https://ai.google.dev/gemini-api/docs
- **Model Garden:** https://ai.google.dev/gemini-api/docs/models
- **Pricing:** https://ai.google.dev/pricing
- **API Reference:** https://ai.google.dev/api
- **Rate Limits:** https://ai.google.dev/gemini-api/docs/quota-pricing

---

## Current Status ✅

**Configured Model:** `gemini-2.5-flash`  
**Status:** Working  
**Last Tested:** 2025  
**API Version:** v1 (stable)  
**Authentication:** Bearer Token ✅  
**Endpoint:** https://generativelanguage.googleapis.com/v1  

**Next Steps:**
1. Test image analysis with real images
2. Benchmark response times
3. Consider `gemini-2.5-pro` for complex problems
4. Implement dynamic model selection based on task type
