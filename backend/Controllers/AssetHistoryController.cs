using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InventoryMS.Data;
using InventoryMS.Models.Entities;
using InventoryMS.Models.Enums;

namespace InventoryMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AssetHistoryController : ControllerBase
    {
        private readonly InventoryDb _context;

        public AssetHistoryController(InventoryDb context)
        {
            _context = context;
        }

        // GET: api/AssetHistory
        [HttpGet]
        public async Task<IActionResult> GetAssetHistory([FromQuery] int? assetId = null, [FromQuery] string changeType = null)
        {
            var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();

            using var command = connection.CreateCommand();

            var whereClauses = new List<string>();

            if (assetId.HasValue)
            {
                whereClauses.Add($"ah.AssetId = {assetId.Value}");
            }

            if (!string.IsNullOrEmpty(changeType))
            {
                whereClauses.Add($"ah.ChangeType = '{changeType}'");
            }

            var whereClause = whereClauses.Count > 0 ? "WHERE " + string.Join(" AND ", whereClauses) : "";

            command.CommandText = $@"
                SELECT 
                    ah.Id,
                    ah.AssetId,
                    a.Name as AssetName,
                    ah.ChangedBy,
                    CONCAT(u.Fname, ' ', u.Lname) as ChangedByName,
                    ah.ChangeType,
                    ah.OldValue,
                    ah.NewValue,
                    ah.Notes,
                    ah.ChangedAt
                FROM AssetHistory ah
                INNER JOIN Assets a ON ah.AssetId = a.Id
                INNER JOIN Users u ON ah.ChangedBy = u.Id
                {whereClause}
                ORDER BY ah.ChangedAt DESC";

            var history = new List<AssetHistoryResponseDto>();
            using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                history.Add(new AssetHistoryResponseDto
                {
                    Id = reader.GetInt32(0),
                    AssetId = reader.GetInt32(1),
                    AssetName = reader.GetString(2),
                    ChangedBy = reader.GetInt32(3),
                    ChangedByName = reader.GetString(4),
                    ChangeType = reader.GetString(5),
                    OldValue = reader.IsDBNull(6) ? null : reader.GetString(6),
                    NewValue = reader.IsDBNull(7) ? null : reader.GetString(7),
                    Notes = reader.IsDBNull(8) ? null : reader.GetString(8),
                    ChangedAt = reader.GetDateTime(9)
                });
            }

            return Ok(history);
        }

        // GET: api/AssetHistory/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAssetHistoryEntry(int id)
        {
            var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();

            using var command = connection.CreateCommand();
            command.CommandText = @"
                SELECT 
                    ah.Id,
                    ah.AssetId,
                    a.Name as AssetName,
                    ah.ChangedBy,
                    CONCAT(u.Fname, ' ', u.Lname) as ChangedByName,
                    ah.ChangeType,
                    ah.OldValue,
                    ah.NewValue,
                    ah.Notes,
                    ah.ChangedAt
                FROM AssetHistory ah
                INNER JOIN Assets a ON ah.AssetId = a.Id
                INNER JOIN Users u ON ah.ChangedBy = u.Id
                WHERE ah.Id = @id";

            command.Parameters.Add(new MySqlConnector.MySqlParameter("@id", id));

            using var reader = await command.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
            {
                return NotFound(new { message = $"Asset history entry with ID {id} not found" });
            }

            var entry = new
            {
                id = reader.GetInt32(0),
                assetId = reader.GetInt32(1),
                assetName = reader.GetString(2),
                changedBy = reader.GetInt32(3),
                changedByName = reader.GetString(4),
                changeType = reader.GetString(5),
                oldValue = reader.IsDBNull(6) ? null : reader.GetString(6),
                newValue = reader.IsDBNull(7) ? null : reader.GetString(7),
                notes = reader.IsDBNull(8) ? null : reader.GetString(8),
                changedAt = reader.GetDateTime(9)
            };

            return Ok(entry);
        }

        // GET: api/AssetHistory/asset/5 (Get history for specific asset)
        [HttpGet("asset/{assetId}")]
        public async Task<IActionResult> GetHistoryByAsset(int assetId)
        {
            // Check asset exists
            var asset = await _context.Assets.FindAsync(assetId);
            if (asset == null)
            {
                return NotFound(new { message = "Asset not found" });
            }

            var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();

            using var command = connection.CreateCommand();
            command.CommandText = @"
                SELECT 
                    ah.Id,
                    ah.ChangeType,
                    ah.OldValue,
                    ah.NewValue,
                    ah.Notes,
                    ah.ChangedAt,
                    CONCAT(u.Fname, ' ', u.Lname) as ChangedByName
                FROM AssetHistory ah
                INNER JOIN Users u ON ah.ChangedBy = u.Id
                WHERE ah.AssetId = @assetId
                ORDER BY ah.ChangedAt DESC";

            command.Parameters.Add(new MySqlConnector.MySqlParameter("@assetId", assetId));

            var history = new List<object>();
            using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                history.Add(new
                {
                    id = reader.GetInt32(0),
                    changeType = reader.GetString(1),
                    oldValue = reader.IsDBNull(2) ? null : reader.GetString(2),
                    newValue = reader.IsDBNull(3) ? null : reader.GetString(3),
                    notes = reader.IsDBNull(4) ? null : reader.GetString(4),
                    changedAt = reader.GetDateTime(5),
                    changedByName = reader.GetString(6)
                });
            }

            return Ok(new
            {
                assetId = assetId,
                assetName = asset.Name,
                historyCount = history.Count,
                history = history
            });
        }

        // POST: api/AssetHistory (Log a change)
        [HttpPost]
        public async Task<IActionResult> LogChange(CreateAssetHistoryDto dto)
        {
            // Validate asset exists
            var asset = await _context.Assets.FindAsync(dto.AssetId);
            if (asset == null)
            {
                return BadRequest(new { message = "Asset not found" });
            }

            // Validate user exists
            var user = await _context.Users.FindAsync(dto.ChangedBy);
            if (user == null)
            {
                return BadRequest(new { message = "User not found" });
            }

            // Validate change type
            if (!Enum.TryParse<ChangeType>(dto.ChangeType, true, out var changeType))
            {
                return BadRequest(new { message = "Invalid change type" });
            }

            var changedAt = DateTime.UtcNow;

            await _context.Database.ExecuteSqlRawAsync(
                @"INSERT INTO AssetHistory (AssetId, ChangedBy, ChangeType, OldValue, NewValue, Notes, ChangedAt)
                  VALUES ({0}, {1}, {2}, {3}, {4}, {5}, {6})",
                dto.AssetId, dto.ChangedBy, dto.ChangeType, dto.OldValue, dto.NewValue, dto.Notes, changedAt);

            return Ok(new
            {
                message = "Asset change logged successfully",
                assetId = dto.AssetId,
                changeType = dto.ChangeType,
                changedAt = changedAt
            });
        }

        // POST: api/AssetHistory/log-status-change (Helper method for status changes)
        [HttpPost("log-status-change")]
        public async Task<IActionResult> LogStatusChange(LogStatusChangeDto dto)
        {
            // Validate asset exists
            var asset = await _context.Assets.FindAsync(dto.AssetId);
            if (asset == null)
            {
                return BadRequest(new { message = "Asset not found" });
            }

            // Validate user exists
            var user = await _context.Users.FindAsync(dto.ChangedBy);
            if (user == null)
            {
                return BadRequest(new { message = "User not found" });
            }

            var changedAt = DateTime.UtcNow;
            var oldValue = asset.Status.ToString();
            var newValue = dto.NewStatus;
            var notes = dto.Notes ?? $"Status changed from {oldValue} to {newValue}";

            await _context.Database.ExecuteSqlRawAsync(
                @"INSERT INTO AssetHistory (AssetId, ChangedBy, ChangeType, OldValue, NewValue, Notes, ChangedAt)
                  VALUES ({0}, {1}, 'StatusChanged', {2}, {3}, {4}, {5})",
                dto.AssetId, dto.ChangedBy, oldValue, newValue, notes, changedAt);

            return Ok(new
            {
                message = "Status change logged",
                assetId = dto.AssetId,
                oldStatus = oldValue,
                newStatus = newValue,
                changedAt = changedAt
            });
        }

        // DELETE: api/AssetHistory/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHistoryEntry(int id)
        {
            // Check entry exists
            var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();

            using var checkCommand = connection.CreateCommand();
            checkCommand.CommandText = "SELECT Id FROM AssetHistory WHERE Id = @id";
            checkCommand.Parameters.Add(new MySqlConnector.MySqlParameter("@id", id));

            using (var reader = await checkCommand.ExecuteReaderAsync())
            {
                if (!await reader.ReadAsync())
                {
                    return NotFound(new { message = $"Asset history entry with ID {id} not found" });
                }
            }

            await _context.Database.ExecuteSqlRawAsync("DELETE FROM AssetHistory WHERE Id = {0}", id);

            return Ok(new { message = "Asset history entry deleted successfully" });
        }
    }

    // DTOs
    public class AssetHistoryResponseDto
    {
        public int Id { get; set; }
        public int AssetId { get; set; }
        public string AssetName { get; set; }
        public int ChangedBy { get; set; }
        public string ChangedByName { get; set; }
        public string ChangeType { get; set; }
        public string OldValue { get; set; }
        public string NewValue { get; set; }
        public string Notes { get; set; }
        public DateTime ChangedAt { get; set; }
    }

    public class CreateAssetHistoryDto
    {
        public int AssetId { get; set; }
        public int ChangedBy { get; set; }
        public string ChangeType { get; set; }  // Created, Updated, StatusChanged, ConditionChanged, Loaned, Returned, Deleted
        public string OldValue { get; set; }
        public string NewValue { get; set; }
        public string Notes { get; set; }
    }

    public class LogStatusChangeDto
    {
        public int AssetId { get; set; }
        public int ChangedBy { get; set; }
        public string NewStatus { get; set; }
        public string Notes { get; set; }
    }
}
