using Microsoft.EntityFrameworkCore;
using StudentHelper.Core.Models;
using StudentHelper.Infrastructure.Data;

namespace StudentHelper.Infrastructure.Services;

public interface IUserService
{
    Task<User> GetOrCreateDefaultUserAsync();
    Task<User?> GetUserByIdAsync(int userId);
}

public class UserService : IUserService
{
    private readonly ApplicationDbContext _context;
    private const string DEFAULT_USER_EMAIL = "guest@studenthelper.com";

    public UserService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<User> GetOrCreateDefaultUserAsync()
    {
        // Check if default user exists
        var defaultUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == DEFAULT_USER_EMAIL);

        if (defaultUser == null)
        {
            // Create default guest user
            defaultUser = new User
            {
                Name = "Guest User",
                Email = DEFAULT_USER_EMAIL,
                Language = "en",
                Theme = "light",
                CreatedAt = DateTime.UtcNow,
                LastLoginAt = DateTime.UtcNow
            };

            _context.Users.Add(defaultUser);
            await _context.SaveChangesAsync();
        }
        else
        {
            // Update last login time
            defaultUser.LastLoginAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        return defaultUser;
    }

    public async Task<User?> GetUserByIdAsync(int userId)
    {
        return await _context.Users.FindAsync(userId);
    }
}
