using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InventoryMS.Data;
using InventoryMS.Models.Entities;
using InventoryMS.Models.Enums;

namespace InventoryMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly InventoryDb _context;

        public NotificationsController(InventoryDb context)
        {
            _context = context;
        }

        // GET: api/Notifications
        [HttpGet]
        public async Task<IActionResult> GetNotifications([FromQuery] int? userId = null, [FromQuery] bool? isRead = null)
        {
            var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();
            using var command = connection.CreateCommand();

          

            var whereClauses = new List<string>();

            if (userId.HasValue)
            {
                whereClauses.Add($"n.UserId = {userId.Value}");
            }

            if (isRead.HasValue)
            {
                whereClauses.Add($"n.IsRead = {(isRead.Value ? 1 : 0)}");
            }

            var whereClause = whereClauses.Count > 0 ? "WHERE " + string.Join(" AND ", whereClauses) : "";

            command.CommandText = $@"
                SELECT 
                    n.Id,
                    n.UserId,
                    CONCAT(u.Fname, ' ', u.Lname) as UserName,
                    n.Message,
                    n.Type,
                    n.IsRead,
                    n.ReadAt,
                    n.CreatedAt,
                    n.RelatedLoanId,
                    n.RelatedAssetId
                FROM Notifications n
                INNER JOIN Users u ON n.UserId = u.Id
                {whereClause}
                ORDER BY n.CreatedAt DESC";

            var notifications = new List<NotificationResponseDto>();
            using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                notifications.Add(new NotificationResponseDto
                {
                    Id = reader.GetInt32(0),
                    UserId = reader.GetInt32(1),
                    UserName = reader.GetString(2),
                    Message = reader.GetString(3),
                    Type = reader.GetString(4),
                    IsRead = reader.GetBoolean(5),
                    ReadAt = reader.IsDBNull(6) ? null : reader.GetDateTime(6),
                    CreatedAt = reader.GetDateTime(7),
                    RelatedLoanId = reader.IsDBNull(8) ? null : reader.GetInt32(8),
                    RelatedAssetId = reader.IsDBNull(9) ? null : reader.GetInt32(9)
                });
            }

            return Ok(notifications);
        }


        // GET: api/Notifications/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetNotification(int id)
        {
            var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();

            using var command = connection.CreateCommand();
            command.CommandText = @"
                SELECT 
                    n.Id,
                    n.UserId,
                    n.Message,
                    n.Type,
                    n.IsRead,
                    n.CreatedAt
                FROM Notifications n
                WHERE n.Id = @id";

            command.Parameters.Add(new MySqlConnector.MySqlParameter("@id", id));

            using var reader = await command.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
            {
                return NotFound(new { message = $"Notification with ID number {id} not found" });
            }

            var notification = new
            {
                id = reader.GetInt32(0),
                userId = reader.GetInt32(1),
                message = reader.GetString(2),
                type = reader.GetString(3),
                isRead = reader.GetBoolean(4),
                createdAt = reader.GetDateTime(5)
            };

            return Ok(notification);
        }

        // POST: api/Notifications (Create notification)
        [HttpPost]
        public async Task<IActionResult> CreateNotification(CreateNotificationDto dto)
        {
            // Validate user exists
            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null)
            {
                return BadRequest(new { message = "User not found" });
            }

            // Validate notification type
            if (!Enum.TryParse<NotificationType>(dto.Type, true, out var notifType))
            {
                return BadRequest(new { message = "Invalid notification type" });
            }

            var createdAt = DateTime.UtcNow;

            await _context.Database.ExecuteSqlRawAsync(
                @"INSERT INTO Notifications (UserId, Message, Type, IsRead, CreatedAt, RelatedLoanId, RelatedAssetId)
                  VALUES ({0}, {1}, {2}, 0, {3}, {4}, {5})",
                dto.UserId, dto.Message, dto.Type, createdAt, dto.RelatedLoanId, dto.RelatedAssetId);

            return Ok(new
            {
                message = "Notification created successfully",
                userId = dto.UserId,
                type = dto.Type,
                createdAt = createdAt
            });
        }

        // PUT: api/Notifications/5/mark-read
        [HttpPut("{id}/mark-read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            // Check notification exists
            var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();

            using var checkCommand = connection.CreateCommand();
            checkCommand.CommandText = "SELECT IsRead FROM Notifications WHERE Id = @id";
            checkCommand.Parameters.Add(new MySqlConnector.MySqlParameter("@id", id));

            bool isRead = false;

            using (var reader = await checkCommand.ExecuteReaderAsync())
            {
                if (!await reader.ReadAsync())
                {
                    return NotFound(new { message = $"Notification with ID {id} not found" });
                }

                isRead = reader.GetBoolean(0);
            }

            if (isRead)
            {
                return BadRequest(new { message = "Notification already marked as read" });
            }

            var readAt = DateTime.UtcNow;

            await _context.Database.ExecuteSqlRawAsync(
                @"UPDATE Notifications 
                  SET IsRead = 1, ReadAt = {0}
                  WHERE Id = {1}",
                readAt, id);

            return Ok(new
            {
                message = "Notification marked as read",
                readAt = readAt
            });
        }

        // PUT: api/Notifications/mark-all-read
        [HttpPut("mark-all-read")]
        public async Task<IActionResult> MarkAllAsRead([FromQuery] int userId)
        {
            if (userId <= 0)
            {
                return BadRequest(new { message = "Valid userId required" });
            }

            // Check user exists
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return BadRequest(new { message = "User not found" });
            }

            var readAt = DateTime.UtcNow;

            await _context.Database.ExecuteSqlRawAsync(
                @"UPDATE Notifications 
                  SET IsRead = 1, ReadAt = {0}
                  WHERE UserId = {1} AND IsRead = 0",
                readAt, userId);

            return Ok(new
            {
                message = "All notifications marked as read",
                userId = userId,
                readAt = readAt
            });
        }

        // DELETE: api/Notifications/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            // Check notification exists
            var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();

            using var checkCommand = connection.CreateCommand();
            checkCommand.CommandText = "SELECT Id FROM Notifications WHERE Id = @id";
            checkCommand.Parameters.Add(new MySqlConnector.MySqlParameter("@id", id));

            using (var reader = await checkCommand.ExecuteReaderAsync())
            {
                if (!await reader.ReadAsync())
                {
                    return NotFound(new { message = $"Notification with ID {id} not found" });
                }
            }

            await _context.Database.ExecuteSqlRawAsync("DELETE FROM Notifications WHERE Id = {0}", id);

            return Ok(new { message = "Notification deleted successfully" });
        }

        // POST: api/Notifications/send-overdue-reminders (System function)
        [HttpPost("send-overdue-reminders")]
        public async Task<IActionResult> SendOverdueReminders()
        {
            // Find all overdue loans
            var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();

            using var command = connection.CreateCommand();
            command.CommandText = @"
                SELECT 
                    l.Id as LoanId,
                    l.UserId,
                    a.Name as AssetName,
                    DATEDIFF(NOW(), l.DueDate) as DaysOverdue
                FROM Loans l
                INNER JOIN Assets a ON l.AssetId = a.Id
                WHERE l.Status = 0 AND l.DueDate < NOW()";

            var overdueLoans = new List<(int loanId, int userId, string assetName, int daysOverdue)>();

            using (var reader = await command.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    overdueLoans.Add((
                        reader.GetInt32(0),
                        reader.GetInt32(1),
                        reader.GetString(2),
                        reader.GetInt32(3)
                    ));
                }
            }

            if (overdueLoans.Count == 0)
            {
                return Ok(new { message = "No overdue loans found", count = 0 });
            }

            // Create notifications for each overdue loan
            foreach (var loan in overdueLoans)
            {
                var message = $"Your loan for '{loan.assetName}' is overdue by {loan.daysOverdue} day(s). Please return it immediately.";

                await _context.Database.ExecuteSqlRawAsync(
                    @"INSERT INTO Notifications (UserId, Message, Type, IsRead, CreatedAt, RelatedLoanId)
                      VALUES ({0}, {1}, 'Overdue', 0, {2}, {3})",
                    loan.userId, message, DateTime.UtcNow, loan.loanId);
            }

            return Ok(new
            {
                message = "Overdue reminders sent successfully",
                count = overdueLoans.Count
            });
        }
    }

    // DTOs
    public class NotificationResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string Message { get; set; }
        public string Type { get; set; }
        public bool IsRead { get; set; }
        public DateTime? ReadAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? RelatedLoanId { get; set; }
        public int? RelatedAssetId { get; set; }
    }

    public class CreateNotificationDto
    {
        public int UserId { get; set; }
        public string Message { get; set; }
        public string Type { get; set; }  // Overdue, DueSoon, Approved, Rejected, Info, Warning
        public int? RelatedLoanId { get; set; }
        public int? RelatedAssetId { get; set; }
    }
}

//kept on using raw sql to avoid c# and db clash of null values(messy db)
// more modificatiions needed?