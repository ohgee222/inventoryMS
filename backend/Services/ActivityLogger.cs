using InventoryMS.Data;
using InventoryMS.Models.Entities;
using Microsoft.EntityFrameworkCore;


namespace InventoryMS.Services
{
    public class ActivityLogger
    {
        private readonly InventoryDb _context;

        public ActivityLogger(InventoryDb context)
        {
            _context = context;
        }

        public async Task LogAsync(
            string activityType, 
            string description, 
            int? userId = null, 
            string? userName = null,
            string? relatedEntityType = null, 
            int? relatedEntityId = null)
        {
            try
            {
                await _context.Database.ExecuteSqlRawAsync(
                    @"INSERT INTO ActivityLogs (UserId, UserName, ActivityType, Description, RelatedEntityType, RelatedEntityId, CreatedAt)
                      VALUES ({0}, {1}, {2}, {3}, {4}, {5}, {6})",
                    userId, userName, activityType, description, relatedEntityType, relatedEntityId, DateTime.UtcNow);
            }
            catch (Exception ex)
            {
                // Log error but don't fail the main operation
                Console.WriteLine($"Failed to log activity: {ex.Message}");
            }
        }
    }
}