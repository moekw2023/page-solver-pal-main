# Student Helper - ASP.NET Core Version

## 🎯 Overview

This is the **ASP.NET Core 8.0** implementation of the Student Helper application - an AI-powered math learning platform that helps students solve problems, track progress, and achieve their learning goals.

## 🏗️ Architecture

### Project Structure

```
StudentHelper.NET/
├── StudentHelper.Web/          # ASP.NET Core MVC Web Application
│   ├── Controllers/            # MVC Controllers
│   ├── Views/                  # Razor Views
│   ├── Hubs/                   # SignalR Hubs for real-time features
│   ├── wwwroot/                # Static files (CSS, JS, images)
│   └── Program.cs              # Application configuration
├── StudentHelper.Core/         # Domain Models & Interfaces
│   ├── Models/                 # Entity models
│   └── Interfaces/             # Service interfaces
└── StudentHelper.Infrastructure/  # Data Access & Services
    ├── Data/                   # DbContext & Migrations
    └── Services/               # Service implementations
```

### Technology Stack

- **Framework**: ASP.NET Core 8.0 MVC
- **Database**: SQL Server (LocalDB for development)
- **ORM**: Entity Framework Core 8.0
- **Real-time**: SignalR
- **Frontend**: Razor Views + Tailwind CSS
- **Icons**: Lucide Icons
- **AI**: OpenAI GPT-4 API

## 🚀 Getting Started

### Prerequisites

- .NET 8.0 SDK or later
- SQL Server or SQL Server LocalDB
- Visual Studio 2022 or VS Code
- OpenAI API Key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd StudentHelper.NET
   ```

2. **Update Connection String**
   
   Edit `StudentHelper.Web/appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=StudentHelperDb;Trusted_Connection=True;"
     },
     "AI": {
       "ApiKey": "your-openai-api-key-here",
       "Endpoint": "https://api.openai.com/v1"
     }
   }
   ```

3. **Restore packages**
   ```bash
   dotnet restore
   ```

4. **Create database**
   ```bash
   cd StudentHelper.Web
   dotnet ef database update --project ../StudentHelper.Infrastructure
   ```

5. **Run the application**
   ```bash
   dotnet run --project StudentHelper.Web
   ```

6. **Open browser**
   Navigate to `https://localhost:5001` or `http://localhost:5000`

## 📚 Features Implemented

### Tier 1: Core Features ✅
- ✅ Camera/Upload scanning with OCR
- ✅ AI-powered problem analysis
- ✅ Step-by-step solutions
- ✅ Problem history tracking
- ✅ Multi-language support
- ✅ Dark/Light theme

### Tier 2: Enhanced Learning ✅
- ✅ Progress dashboard with statistics
- ✅ Study timer with Pomodoro technique
- ✅ Search & filter history
- ✅ Difficulty assessment
- ✅ Subject categorization
- ✅ Performance analytics

### Tier 3: Advanced Features ✅
- ✅ AI Chat tutor
- ✅ Video explanations
- ✅ Voice input
- ✅ Smart flashcards
- ✅ Study groups with real-time chat

### Tier 4: Gamification ✅
- ✅ Achievement system (10+ badges)
- ✅ Daily challenges
- ✅ Study Buddy AI advisor
- ✅ Streak tracking
- ✅ Points & rewards

## 🗄️ Database Schema

### Main Tables

- **Users** - User accounts and preferences
- **HistoryItems** - Solved problems history
- **Achievements** - User achievements and progress
- **DailyChallenges** - Daily challenge problems
- **ChallengeAttempts** - User challenge submissions
- **StudySessions** - Study timer sessions
- **Flashcards** - User-created flashcards
- **StudyGroups** - Collaborative study groups
- **StudyGroupMembers** - Group membership
- **GroupMessages** - Real-time group chat messages

## 🔧 Development

### Adding a New Feature

1. **Create Model** in `StudentHelper.Core/Models/`
2. **Add Interface** in `StudentHelper.Core/Interfaces/`
3. **Implement Service** in `StudentHelper.Infrastructure/Services/`
4. **Register Service** in `Program.cs`
5. **Create Controller** in `StudentHelper.Web/Controllers/`
6. **Add Views** in `StudentHelper.Web/Views/`
7. **Create Migration**:
   ```bash
   dotnet ef migrations add FeatureName --project StudentHelper.Infrastructure --startup-project StudentHelper.Web
   dotnet ef database update --project StudentHelper.Infrastructure --startup-project StudentHelper.Web
   ```

### Running Migrations

```bash
# Create migration
dotnet ef migrations add MigrationName --project StudentHelper.Infrastructure --startup-project StudentHelper.Web

# Update database
dotnet ef database update --project StudentHelper.Infrastructure --startup-project StudentHelper.Web

# Remove last migration
dotnet ef migrations remove --project StudentHelper.Infrastructure --startup-project StudentHelper.Web
```

### Building for Production

```bash
# Publish application
dotnet publish StudentHelper.Web -c Release -o ./publish

# Run published app
cd publish
dotnet StudentHelper.Web.dll
```

## 🔐 Configuration

### Environment Variables

Create `appsettings.Production.json` for production settings:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=production-server;Database=StudentHelperDb;User Id=username;Password=password;"
  },
  "AI": {
    "ApiKey": "production-api-key",
    "Endpoint": "https://api.openai.com/v1"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Warning"
    }
  }
}
```

## 🧪 Testing

```bash
# Run all tests
dotnet test

# Run with coverage
dotnet test /p:CollectCoverage=true
```

## 📡 SignalR Hubs

### ChatHub
- Real-time AI chat
- Message broadcasting
- Typing indicators

### StudyGroupHub
- Group chat
- Member presence
- Progress sharing

## 🎨 UI Customization

The application uses **Tailwind CSS** for styling. All views are in `Views/` folder and use the shared layout in `Views/Shared/_Layout.cshtml`.

### Customizing Colors

Edit Tailwind classes in views or add custom CSS in `wwwroot/css/app.css`.

## 🔒 Security

- HTTPS enabled by default
- CSRF protection
- SQL injection prevention via EF Core parameterization
- XSS protection in Razor views
- Session-based authentication

## 📱 API Endpoints

### Camera Controller
- `POST /Camera/AnalyzeImage` - Analyze uploaded image
- `POST /Camera/GenerateSteps` - Generate step-by-step solution

### History Controller
- `GET /History` - Get user history
- `GET /History/Details/{id}` - Get history item details
- `POST /History/Delete/{id}` - Delete history item
- `GET /History/Statistics` - Get statistics

### Achievements Controller
- `GET /Achievements` - Get user achievements
- `POST /Achievements/CheckAchievements` - Check for new achievements

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Reset database
dotnet ef database drop --project StudentHelper.Infrastructure --startup-project StudentHelper.Web
dotnet ef database update --project StudentHelper.Infrastructure --startup-project StudentHelper.Web
```

### Package Restore Issues
```bash
# Clear NuGet cache
dotnet nuget locals all --clear
dotnet restore
```

### Build Errors
```bash
# Clean and rebuild
dotnet clean
dotnet build
```

## 📄 License

This project is licensed under the MIT License.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 🔗 Related Projects

- **React Version**: Original React + TypeScript implementation
- **Mobile App**: React Native version (planned)
- **API**: Standalone REST API (planned)

## 📞 Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/yourusername/student-helper/issues)
- Documentation: See `docs/` folder
- Email: support@studenthelper.com

## 🚀 Deployment

### Azure App Service

1. Create App Service in Azure Portal
2. Configure connection strings in Application Settings
3. Deploy using Visual Studio or Azure DevOps

### Docker

```dockerfile
# Dockerfile included in project root
docker build -t studenthelper .
docker run -p 5000:80 studenthelper
```

### IIS

1. Install .NET 8.0 Hosting Bundle
2. Create IIS site pointing to publish folder
3. Configure application pool to use "No Managed Code"

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Migrated from**: React/TypeScript version
