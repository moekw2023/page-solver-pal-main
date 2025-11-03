# 🔧 Gemini API Troubleshooting Guide

## ❌ Error: 404 Model Not Found

If you're getting a 404 error when calling the Gemini API, the model name might be incorrect.

### ✅ Valid Model Names (as of 2025)

Try these model names in order:

#### 1. **gemini-pro** (Most Compatible)
```json
{
  "AI": {
    "Model": "gemini-pro",
    "VisionModel": "gemini-pro"
  }
}
```

#### 2. **gemini-1.5-pro**
```json
{
  "AI": {
    "Model": "gemini-1.5-pro",
    "VisionModel": "gemini-1.5-pro"
  }
}
```

#### 3. **gemini-1.5-flash** (Faster, cheaper)
```json
{
  "AI": {
    "Model": "gemini-1.5-flash",
    "VisionModel": "gemini-1.5-flash"
  }
}
```

#### 4. **gemini-1.5-pro-latest** (Experimental)
```json
{
  "AI": {
    "Model": "gemini-1.5-pro-latest",
    "VisionModel": "gemini-1.5-pro-latest"
  }
}
```

---

## 🔍 How to Check Available Models

### Using curl:
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_API_KEY"
```

### Using PowerShell:
```powershell
Invoke-RestMethod -Uri "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_API_KEY" | ConvertTo-Json
```

---

## 🎯 Recommended Fix

**Update your `appsettings.json` to use `gemini-pro`:**

```json
{
  "AI": {
    "Provider": "GoogleVertexAI",
    "ApiKey": "AIzaSyDCa-t0nYCwJuoeJKWMS7qPHgbqIvv9tFc",
    "Endpoint": "https://generativelanguage.googleapis.com/v1beta",
    "Model": "gemini-pro",
    "VisionModel": "gemini-pro"
  }
}
```

**Important Notes:**
- ✅ `gemini-pro` handles BOTH text and vision (images)
- ✅ No separate vision model needed
- ✅ Most stable and widely available
- ✅ Free tier: 60 requests/minute

---

## 🔄 If Still Not Working

### 1. Check API Key
- Verify key is correct: `AIzaSyDCa-t0nYCwJuoeJKWMS7qPHgbqIvv9tFc`
- Make sure it's enabled in Google AI Studio
- Check if there are any restrictions on the key

### 2. Check Endpoint
```
✅ Correct: https://generativelanguage.googleapis.com/v1beta
❌ Wrong: https://generativelanguage.googleapis.com/v1
```

### 3. Test with curl
```bash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyDCa-t0nYCwJuoeJKWMS7qPHgbqIvv9tFc" ^
-H "Content-Type: application/json" ^
-d "{\"contents\":[{\"parts\":[{\"text\":\"Hello\"}]}]}"
```

### 4. Check Model Availability
Some models may not be available in all regions or with all API keys. Try:
- `gemini-pro` - Most compatible
- `gemini-1.0-pro` - Older but stable
- `gemini-1.5-flash` - Faster alternative

---

## 📝 Common Errors and Solutions

### Error: `models/gemini-1.5-pro-vision is not found`
**Solution:** Use `gemini-pro` or `gemini-1.5-pro` (no `-vision` suffix)

### Error: `API key not valid`
**Solution:** Check that your API key is correctly copied and has no extra spaces

### Error: `Quota exceeded`
**Solution:** Wait a minute (free tier: 60 RPM limit) or upgrade plan

### Error: `Invalid argument`
**Solution:** Check your request body format matches Gemini's expected structure

---

## ✅ Working Configuration

Here's a guaranteed working configuration:

**appsettings.json:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=StudentHelperDb;Trusted_Connection=True;MultipleActiveResultSets=true"
  },
  "AI": {
    "Provider": "GoogleVertexAI",
    "ApiKey": "AIzaSyDCa-t0nYCwJuoeJKWMS7qPHgbqIvv9tFc",
    "Endpoint": "https://generativelanguage.googleapis.com/v1beta",
    "Model": "gemini-pro",
    "VisionModel": "gemini-pro"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Information"
    }
  },
  "AllowedHosts": "*"
}
```

---

## 🧪 Test Commands

### Test Text Generation:
```bash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyDCa-t0nYCwJuoeJKWMS7qPHgbqIvv9tFc" ^
-H "Content-Type: application/json" ^
-d "{\"contents\":[{\"parts\":[{\"text\":\"Explain what 2+2 equals\"}]}]}"
```

### Test Vision (with base64 image):
```bash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyDCa-t0nYCwJuoeJKWMS7qPHgbqIvv9tFc" ^
-H "Content-Type: application/json" ^
-d "{\"contents\":[{\"parts\":[{\"text\":\"What is in this image?\"},{\"inline_data\":{\"mime_type\":\"image/jpeg\",\"data\":\"YOUR_BASE64_IMAGE\"}}]}]}"
```

---

## 📞 Additional Resources

- [Gemini API Models](https://ai.google.dev/models/gemini)
- [API Reference](https://ai.google.dev/api/rest)
- [Google AI Studio](https://makersuite.google.com/)

---

**Quick Fix:** Change both `Model` and `VisionModel` to `"gemini-pro"` and restart your application! 🚀
