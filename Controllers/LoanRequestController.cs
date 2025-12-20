using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InventoryMS.Data;
using InventoryMS.Models.Entities;
using InventoryMS.Models.Enums;

namespace InventoryMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoanRequestsController : ControllerBase
    {
        private readonly InventoryDb _context;

        public LoanRequestsController(InventoryDb context)
        {
            _context = context;
        }

        // GET: api/LoanRequests
        [HttpGet]
        public async Task<IActionResult> GetLoanRequests([FromQuery] string status = null)
        {
            var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();

            using var command = connection.CreateCommand();

            var whereClause = "";
            if (!string.IsNullOrEmpty(status))
            {
                whereClause = status.ToLower() switch
                {
                    "pending" => "WHERE COALESCE(lr.Status, 'Pending') = 'Pending'",
                    "approved" => "WHERE COALESCE(lr.Status, 'Pending') = 'Approved'",
                    "rejected" => "WHERE COALESCE(lr.Status, 'Pending') = 'Rejected'",
                    _ => ""
                };
            }

            command.CommandText = $@"
                SELECT 
                    lr.Id,
                    lr.UserId,
                    CONCAT(u.Fname, ' ', u.Lname) as UserName,
                    u.UniversityId,
                    lr.AssetId,
                    a.Name as AssetName,
                    a.SerialNumber,
                    lr.RequestDate,
                    lr.RequestedStartDate,
                    lr.RequestedEndDate,
                    lr.Purpose,
                    COALESCE(lr.Status, 'Pending') as Status,
                    lr.ReviewedByStaffId,
                    lr.ReviewedAt,
                    lr.RejectionReason
                FROM LoanRequests lr
                INNER JOIN Users u ON lr.UserId = u.Id
                INNER JOIN Assets a ON lr.AssetId = a.Id
                {whereClause}
                ORDER BY lr.RequestDate DESC";

            var requests = new List<LoanRequestResponseDto>();
            using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                requests.Add(new LoanRequestResponseDto
                {
                    Id = reader.GetInt32(0),
                    UserId = reader.GetInt32(1),
                    UserName = reader.GetString(2),
                    UniversityId = reader.GetString(3),
                    AssetId = reader.GetInt32(4),
                    AssetName = reader.GetString(5),
                    SerialNumber = reader.IsDBNull(6) ? "" : reader.GetString(6),
                    RequestDate = reader.GetDateTime(7),
                    RequestedStartDate = reader.GetDateTime(8),
                    RequestedEndDate = reader.GetDateTime(9),
                    Purpose = reader.IsDBNull(10) ? "" : reader.GetString(10),
                    Status = reader.GetString(11),
                    ReviewedByStaffId = reader.IsDBNull(12) ? null : reader.GetInt32(12),
                    ReviewedAt = reader.IsDBNull(13) ? null : reader.GetDateTime(13),
                    RejectionReason = reader.IsDBNull(14) ? null : reader.GetString(14)
                });
            }

            return Ok(requests);
        }

        // GET: api/LoanRequests/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetLoanRequest(int id)
        {
            var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();

            using var command = connection.CreateCommand();
            command.CommandText = @"
                SELECT 
                    lr.Id,
                    lr.UserId,
                    CONCAT(u.Fname, ' ', u.Lname) as UserName,
                    lr.AssetId,
                    a.Name as AssetName,
                    lr.RequestDate,
                    lr.RequestedStartDate,
                    lr.RequestedEndDate,
                    lr.Purpose,
                    COALESCE(lr.Status, 'Pending') as Status
                FROM LoanRequests lr
                INNER JOIN Users u ON lr.UserId = u.Id
                INNER JOIN Assets a ON lr.AssetId = a.Id
                WHERE lr.Id = @id";

            command.Parameters.Add(new MySqlConnector.MySqlParameter("@id", id));

            using var reader = await command.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
            {
                return NotFound(new { message = $"Loan request with ID {id} not found" });
            }

            var request = new
            {
                id = reader.GetInt32(0),
                userId = reader.GetInt32(1),
                userName = reader.GetString(2),
                assetId = reader.GetInt32(3),
                assetName = reader.GetString(4),
                requestDate = reader.GetDateTime(5),
                requestedStartDate = reader.GetDateTime(6),
                requestedEndDate = reader.GetDateTime(7),
                purpose = reader.IsDBNull(8) ? "" : reader.GetString(8),
                status = reader.GetString(9)
            };

            return Ok(request);
        }

        // POST: api/LoanRequests (Create new request)
        [HttpPost]
        public async Task<IActionResult> CreateLoanRequest(CreateLoanRequestDto dto)
        {
            // Validate asset exists
            var asset = await _context.Assets.FindAsync(dto.AssetId);
            if (asset == null)
            {
                return BadRequest(new { message = "Asset not found" });
            }

            // Validate user exists
            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null)
            {
                return BadRequest(new { message = "User not found" });
            }

            if (!user.IsActive)
            {
                return BadRequest(new { message = "User account is inactive" });
            }

            // Check if asset is available
            if (asset.Status != AssetStatus.Available)
            {
                return BadRequest(new { message = $"Asset is not available. Current status: {asset.Status}" });
            }

            // Create request using raw SQL
            var requestDate = DateTime.UtcNow;

            await _context.Database.ExecuteSqlRawAsync(
                @"INSERT INTO LoanRequests (UserId, AssetId, RequestDate, RequestedStartDate, RequestedEndDate, Purpose, Status)
                  VALUES ({0}, {1}, {2}, {3}, {4}, {5}, 'Pending')",
                dto.UserId, dto.AssetId, requestDate, dto.RequestedStartDate, dto.RequestedEndDate, dto.Purpose);

            return Ok(new
            {
                message = "Loan request created successfully",
                userId = dto.UserId,
                assetId = dto.AssetId,
                requestDate = requestDate,
                status = "Pending"
            });
        }

        // PUT: api/LoanRequests/5/approve
        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveLoanRequest(int id, ApproveLoanRequestDto dto)
        {
            // Check request exists
            var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();

            using var checkCommand = connection.CreateCommand();
            checkCommand.CommandText = @"
                SELECT UserId, AssetId, RequestedEndDate, COALESCE(Status, 'Pending') as Status 
                FROM LoanRequests 
                WHERE Id = @id";
            checkCommand.Parameters.Add(new MySqlConnector.MySqlParameter("@id", id));

            int userId = 0;
            int assetId = 0;
            DateTime requestedEndDate = DateTime.MinValue;
            string status = "";

            using (var reader = await checkCommand.ExecuteReaderAsync())
            {
                if (!await reader.ReadAsync())
                {
                    return NotFound(new { message = $"Loan request with ID {id} not found" });
                }

                userId = reader.GetInt32(0);
                assetId = reader.GetInt32(1);
                requestedEndDate = reader.GetDateTime(2);
                status = reader.GetString(3);
            }

            if (status != "Pending")
            {
                return BadRequest(new { message = $"Request already {status.ToLower()}" });
            }

            // Validate staff member
            var staff = await _context.Users.FindAsync(dto.StaffId);
            if (staff == null || (staff.Role != UserRole.Staff && staff.Role != UserRole.Admin))
            {
                return BadRequest(new { message = "Invalid staff member" });
            }

            // Check asset is still available
            var asset = await _context.Assets.FindAsync(assetId);
            if (asset.Status != AssetStatus.Available)
            {
                return BadRequest(new { message = "Asset is no longer available" });
            }

            // Update request to Approved
            var reviewedAt = DateTime.UtcNow;
            await _context.Database.ExecuteSqlRawAsync(
                @"UPDATE LoanRequests 
                  SET Status = 'Approved', 
                      ReviewedByStaffId = {0}, 
                      ReviewedAt = {1}
                  WHERE Id = {2}",
                dto.StaffId, reviewedAt, id);

            // Create loan automatically
            var checkOutDate = DateTime.UtcNow;
            await _context.Database.ExecuteSqlRawAsync(
                @"INSERT INTO Loans (AssetId, UserId, ApprovedByStaffId, CheckOutDate, DueDate, Status, OverdueDays, CreatedAt)
                  VALUES ({0}, {1}, {2}, {3}, {4}, 0, 0, {5})",
                assetId, userId, dto.StaffId, checkOutDate, requestedEndDate, checkOutDate);

            // Update asset status
            asset.Status = AssetStatus.CheckedOut;
            asset.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Loan request approved and loan created",
                loanCreated = true,
                reviewedAt = reviewedAt
            });
        }

        // PUT: api/LoanRequests/5/reject
        [HttpPut("{id}/reject")]
        public async Task<IActionResult> RejectLoanRequest(int id, RejectLoanRequestDto dto)
        {
            // Check request exists
            var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();

            using var checkCommand = connection.CreateCommand();
            checkCommand.CommandText = "SELECT COALESCE(Status, 'Pending') as Status FROM LoanRequests WHERE Id = @id";
            checkCommand.Parameters.Add(new MySqlConnector.MySqlParameter("@id", id));

            string status = "";

            using (var reader = await checkCommand.ExecuteReaderAsync())
            {
                if (!await reader.ReadAsync())
                {
                    return NotFound(new { message = $"Loan request with ID {id} not found" });
                }

                status = reader.GetString(0);
            }

            if (status != "Pending")
            {
                return BadRequest(new { message = $"Request already {status.ToLower()}" });
            }

            // Validate staff member
            var staff = await _context.Users.FindAsync(dto.StaffId);
            if (staff == null || (staff.Role != UserRole.Staff && staff.Role != UserRole.Admin))
            {
                return BadRequest(new { message = "Invalid staff member" });
            }

            // Update request to Rejected
            var reviewedAt = DateTime.UtcNow;
            await _context.Database.ExecuteSqlRawAsync(
                @"UPDATE LoanRequests 
                  SET Status = 'Rejected', 
                      ReviewedByStaffId = {0}, 
                      ReviewedAt = {1},
                      RejectionReason = {2}
                  WHERE Id = {3}",
                dto.StaffId, reviewedAt, dto.RejectionReason, id);

            return Ok(new
            {
                message = "Loan request rejected",
                reviewedAt = reviewedAt,
                reason = dto.RejectionReason
            });
        }
    }

    // DTOs
    public class LoanRequestResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string UniversityId { get; set; }
        public int AssetId { get; set; }
        public string AssetName { get; set; }
        public string SerialNumber { get; set; }
        public DateTime RequestDate { get; set; }
        public DateTime RequestedStartDate { get; set; }
        public DateTime RequestedEndDate { get; set; }
        public string Purpose { get; set; }
        public string Status { get; set; }
        public int? ReviewedByStaffId { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string RejectionReason { get; set; }
    }

    public class CreateLoanRequestDto
    {
        public int UserId { get; set; }
        public int AssetId { get; set; }
        public DateTime RequestedStartDate { get; set; }
        public DateTime RequestedEndDate { get; set; }
        public string Purpose { get; set; }
    }

    public class ApproveLoanRequestDto
    {
        public int StaffId { get; set; }
    }

    public class RejectLoanRequestDto
    {
        public int StaffId { get; set; }
        public string RejectionReason { get; set; }
    }
}


//used raw sql to avoid databse error like the loancontroller error 