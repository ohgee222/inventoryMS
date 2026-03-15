using Microsoft.AspNetCore.Mvc;
using InventoryMS.Data;
using InventoryMS.Models.Entities;
using InventoryMS.Models.Enums;
using Microsoft.EntityFrameworkCore;


namespace InventoryMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ActivityLogsController : ControllerBase
    {
        private readonly InventoryDb _context;

        public ActivityLogsController(InventoryDb context)
        {
            _context = context;
        }

        // GET: api/ActivityLogs?limit=20
        [HttpGet]
        [HttpGet]
public async Task<IActionResult> GetRecentActivity([FromQuery] int limit = 20)
{
    limit = Math.Clamp(limit, 1, 100);

    var connection = _context.Database.GetDbConnection();
    await connection.OpenAsync();

    using var command = connection.CreateCommand();
    command.CommandText = @"
        SELECT 
            Id,
            UserId,
            UserName,
            ActivityType,
            Description,
            RelatedEntityType,
            RelatedEntityId,
            CreatedAt
        FROM ActivityLogs
        ORDER BY CreatedAt DESC
        LIMIT @limit";

    command.Parameters.Add(new MySqlConnector.MySqlParameter("@limit", limit));

    var activities = new List<ActivityLogDto>();
    using var reader = await command.ExecuteReaderAsync();

    while (await reader.ReadAsync())
    {
        activities.Add(new ActivityLogDto
        {
            Id = reader.GetInt32(0),
            UserId = reader.IsDBNull(1) ? null : reader.GetInt32(1),
            UserName = reader.IsDBNull(2) ? null : reader.GetString(2),
            ActivityType = reader.GetString(3),
            Description = reader.GetString(4),
            RelatedEntityType = reader.IsDBNull(5) ? null : reader.GetString(5),
            RelatedEntityId = reader.IsDBNull(6) ? null : reader.GetInt32(6),
            CreatedAt = reader.GetDateTime(7)
        });
    }

    return Ok(activities);
}
    }

    public class ActivityLogDto
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public string? UserName { get; set; }
        public string ActivityType { get; set; }
        public string Description { get; set; }
        public string? RelatedEntityType { get; set; }
        public int? RelatedEntityId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}