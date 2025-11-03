# 🚀 Quick Start - StudentHelper.NET

## Run the Application (3 Steps)

### 1. Navigate to Project
```bash
cd StudentHelper.NET\StudentHelper.Web
```

### 2. Run Application
```bash
dotnet run
```

### 3. Open Browser
```
https://localhost:5001
```

---

## Test Features

### ✅ Camera - Upload Math Problem
1. Go to: `https://localhost:5001/Camera`
2. Upload image or take photo
3. Click "Analyze with AI"
4. Get step-by-step solution

### ✅ AI Chat
1. Navigate to AI Chat
2. Ask: "Explain quadratic equations"
3. Get detailed response

### ✅ Achievements
1. Go to: `https://localhost:5001/Achievements`
2. View progress
3. Unlock achievements

---

## If Something Goes Wrong

### Test API Directly
```bash
cd StudentHelper.NET
test-fixed-api.bat
```

### Check Database
```bash
dotnet ef database update --project StudentHelper.Infrastructure --startup-project StudentHelper.Web
```

### View Logs
Check console output for detailed error messages

---

## Key Configuration

**File**: `appsettings.json`

```json
{
  "AI": {
    "ApiKey": "AIzaSyDCa-t0nYCwJuoeJKWMS7qPHgbqIvv9tFc",
    "Endpoint": "https://generativelanguage.googleapis.com/v1",
    "Model": "gemini-2.5-flash"
  }
}
```

---

## What Was Fixed

✅ **Gemini API Authentication**
- Changed from Bearer token to query parameter
- File: `StudentHelper.Infrastructure/Services/AIService.cs`
- Lines: 52-54, 177-179

✅ **Database Schema**
- Migration created: `InitialCreate`
- 10 tables created
- Ready for use

---

## Documentation

- `FINAL_STATUS.md` - Complete status report
- `SETUP_COMPLETE.md` - Setup completion guide
- `GOOGLE_GEMINI_SETUP.md` - API integration details
- `README.md` - Full documentation

---

## Expected Result

When you upload an image:
1. Image sends to Gemini API ✅
2. AI analyzes the problem ✅
3. Returns step-by-step solution ✅
4. Saves to database ✅

---

**Status**: ✅ Ready to test!  
**Date**: November 3, 2025
