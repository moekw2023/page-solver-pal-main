# 🚀 Quick Start Guide - Student Helper .NET

## ⚡ 5-Minute Setup

### Step 1: Prerequisites Check
```bash
# Check .NET version (need 8.0+)
dotnet --version

# Should show: 8.0.x or higher
```

### Step 2: Navigate to Project
```bash
cd StudentHelper.NET
```

### Step 3: Configure API Key
Open `StudentHelper.Web/appsettings.json` and add your OpenAI API key:

```json
{
  "AI": {
    "ApiKey": "sk-your-openai-api-key-here"
  }
}
```

### Step 4: Restore & Build
```bash
dotnet restore
dotnet build
```

### Step 5: Create Database
```bash
cd StudentHelper.Web
dotnet ef migrations add InitialCreate --project ../StudentHelper.Infrastructure
dotnet ef database update --project ../StudentHelper.Infrastructure
```

### Step 6: Run!
```bash
dotnet run
```

Open: **https://localhost:5001**

---

## 🎯 What You'll See

### Home Page (`/`)
- Beautiful landing page with features grid
- 9 feature cards
- Call-to-action buttons

### Camera Page (`/Camera`)
- Upload or capture images
- AI-powered problem analysis
- Step-by-step solutions

### Achievements (`/Achievements`)
- Progress tracking
- Unlock badges
- Rarity system

---

## 🔧 Common Issues

### Issue: "Database connection failed"
**Solution**: Using LocalDB by default. If not installed:
```json
// Use SQLite instead in appsettings.json
"ConnectionStrings": {
  "DefaultConnection": "Data Source=studenthelper.db"
}
```

Then install SQLite:
```bash
dotnet add package Microsoft.EntityFrameworkCore.Sqlite --project StudentHelper.Infrastructure
```

### Issue: "AI API call failed"
**Solution**: Check your API key in `appsettings.json`

### Issue: "Migration not found"
**Solution**: Create the initial migration:
```bash
dotnet ef migrations add InitialCreate --project StudentHelper.Infrastructure --startup-project StudentHelper.Web
```

---

## 📁 Project Structure

```
StudentHelper.NET/
├── StudentHelper.sln           # Open this in Visual Studio
├── StudentHelper.Core/         # Domain models
├── StudentHelper.Infrastructure/  # Data & services
└── StudentHelper.Web/          # Web application (START HERE)
    ├── Program.cs              # App configuration
    ├── Controllers/            # MVC controllers
    ├── Views/                  # Razor views
    └── wwwroot/                # Static files
```

---

## 🎨 Key URLs

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Landing page |
| Camera | `/Camera` | Problem scanner |
| History | `/History` | Past problems |
| Achievements | `/Achievements` | Badges & progress |
| Dashboard | `/Dashboard` | Statistics |

---

## 🔑 Environment Variables (Optional)

Create `appsettings.Development.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=StudentHelperDb;Trusted_Connection=True;"
  },
  "AI": {
    "ApiKey": "your-dev-api-key",
    "Endpoint": "https://api.openai.com/v1"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Debug"
    }
  }
}
```

---

## 🧪 Test the App

### Test Camera Feature
1. Go to `/Camera`
2. Upload a math problem image
3. Click "Analyze Problem"
4. View solution

### Test Achievements
1. Go to `/Achievements`
2. Click "Check Progress"
3. See unlocked achievements

---

## 🆘 Need Help?

1. **Check logs**: Look at terminal output
2. **Check docs**: See `README.md` and `MIGRATION_GUIDE.md`
3. **Rebuild**: `dotnet clean && dotnet build`
4. **Reset DB**: `dotnet ef database drop -f --project StudentHelper.Infrastructure`

---

## ✅ Success Checklist

- [ ] .NET 8.0+ installed
- [ ] Project builds successfully
- [ ] Database created
- [ ] API key configured
- [ ] App runs on https://localhost:5001
- [ ] Can upload/scan images
- [ ] AI analysis works

---

## 🎉 You're Ready!

The app is now running. Explore the features and start solving problems!

**Next Steps:**
- Implement authentication
- Add more views
- Customize UI
- Deploy to production

---

**Quick Start Version**: 1.0  
**Last Updated**: January 2025
