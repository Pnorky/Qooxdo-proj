using GraphQLApi.Models;
using Microsoft.EntityFrameworkCore;

namespace GraphQLApi.Data;

public static class DatabaseInitializer
{
    public static async Task InitializeAsync(AppDbContext context)
    {
        // Ensure database is created
        await context.Database.EnsureCreatedAsync();

        // Check if any users exist, if not create default admin
        if (!await context.Users.AnyAsync())
        {
            var defaultUser = new User
            {
                Username = "admin",
                Password = "admin",
                CreatedAt = DateTime.UtcNow
            };

            context.Users.Add(defaultUser);
            await context.SaveChangesAsync();
        }
    }
}
