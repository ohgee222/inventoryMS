using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InventoryMS.Data;
using InventoryMS.Models.Entities;
using InventoryMS.Models.Enums;

namespace InventoryMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoansController : ControllerBase
    {
        private readonly InventoryDb _context;

        public LoansController(InventoryDb context)
        {
            _context = context;
        }

        // GET: api/Loans (Raw SQL to avoid NULL issues)
        [HttpGet]
        public async Task<IActionResult> GetLoans()
        {
            var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();

            using var command = connection.CreateCommand();
            command.CommandText = @"
                SELECT 
                    l.Id,
                    l.AssetId,
                    a.Name as AssetName,
                    a.SerialNumber,
                    l.UserId,
                    CONCAT(u.Fname, ' ', u.Lname) as UserName,
                    u.UniversityId as UserUniversityId,
                    l.CheckOutDate,
                    l.DueDate,
                    l.ReturnDate,
                    COALESCE(l.Status, 'Active') as Status,
                    COALESCE(l.OverdueDays, 0) as OverdueDays
                FROM Loans l
                INNER JOIN Assets a ON l.AssetId = a.Id
                INNER JOIN Users u ON l.UserId = u.Id
                ORDER BY l.CheckOutDate DESC";

            var loans = new List<LoanSimpleDto>();
            using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                loans.Add(new LoanSimpleDto
                {
                    Id = reader.GetInt32(0),
                    AssetId = reader.GetInt32(1),
                    AssetName = reader.GetString(2),
                    SerialNumber = reader.IsDBNull(3) ? "" : reader.GetString(3),
                    UserId = reader.GetInt32(4),
                    UserName = reader.GetString(5),
                    UserUniversityId = reader.GetString(6),
                    CheckOutDate = reader.GetDateTime(7),
                    DueDate = reader.GetDateTime(8),
                    ReturnDate = reader.IsDBNull(9) ? null : reader.GetDateTime(9),
                    Status = reader.GetString(10),
                    OverdueDays = reader.GetInt32(11)
                });
            }

            return Ok(loans);
        }

        // POST: api/Loans (Create loan)
        [HttpPost]
        public async Task<IActionResult> CreateLoan(CreateLoanDto dto)
        {
            // Validate asset
            var asset = await _context.Assets.FindAsync(dto.AssetId);
            if (asset == null)
            {
                return BadRequest(new { message = "Asset not found" });
            }

            if (asset.Status != AssetStatus.Available)
            {
                return BadRequest(new { message = $"Asset not available. Status: {asset.Status}" });
            }

            // Validate user
            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null)
            {
                return BadRequest(new { message = "User not found" });
            }

            if (!user.IsActive)
            {
                return BadRequest(new { message = "User account is inactive" });
            }

            // Create loan using raw SQL
            var checkOutDate = DateTime.UtcNow;

            await _context.Database.ExecuteSqlRawAsync(
                @"INSERT INTO Loans (AssetId, UserId, ApprovedByStaffId, CheckOutDate, DueDate, Status, OverdueDays, CreatedAt)
                  VALUES ({0}, {1}, {2}, {3}, {4}, '0', 0, {5})",
                dto.AssetId, dto.UserId, dto.ApprovedByStaffId, checkOutDate, dto.DueDate, checkOutDate);

            // Update asset status
            asset.Status = AssetStatus.CheckedOut;
            asset.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Loan created successfully",
                assetId = dto.AssetId,
                userId = dto.UserId,
                checkOutDate = checkOutDate,
                dueDate = dto.DueDate,
                status = "Active"
            });
        }

        // PUT: api/Loans/{id}/return
        [HttpPut("{id}/return")]
        public async Task<IActionResult> ReturnLoan(int id, ReturnLoanDto dto)
        {
            // Check loan exists and get data using raw SQL
            var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();

            using var checkCommand = connection.CreateCommand();
            checkCommand.CommandText = "SELECT AssetId, DueDate, COALESCE(Status, 'Active') as Status FROM Loans WHERE Id = @id";
            checkCommand.Parameters.Add(new MySqlConnector.MySqlParameter("@id", id));

            int assetId = 0;
            DateTime dueDate = DateTime.MinValue;
            string status = "";

            using (var reader = await checkCommand.ExecuteReaderAsync())
            {
                if (!await reader.ReadAsync())
                {
                    return NotFound(new { message = $"Loan with ID {id} not found" });
                }

                assetId = reader.GetInt32(0);
                dueDate = reader.GetDateTime(1);
                status = reader.GetString(2);
            }
            // Accept: "Active", "0", or "1" as active status
            var isActive = (status == "Active" || status == "0" || status == "1");

            if (!isActive)
            {
                return BadRequest(new { message = $"Loan is not active. Status: {status}" });
            }

            // Validate staff if provided
            if (dto.ReceivedByStaffId.HasValue)
            {
                var staff = await _context.Users.FindAsync(dto.ReceivedByStaffId.Value);
                if (staff == null || (staff.Role != UserRole.Staff && staff.Role != UserRole.Admin))
                {
                    return BadRequest(new { message = "Invalid staff member" });
                }
            }

            // Calculate overdue
            var returnDate = DateTime.UtcNow;
            var overdueDays = 0;
            if (returnDate > dueDate)
            {
                overdueDays = (int)(returnDate - dueDate).TotalDays;
            }

            var returnConditionValue = dto.ReturnCondition.HasValue ? (int)dto.ReturnCondition.Value : (int?)null;

            // Update loan
            await _context.Database.ExecuteSqlRawAsync(
                 @"UPDATE Loans 
                  SET ReturnDate = {0}, 
                      ReturnCondition = {1}, 
                      ReturnNotes = {2}, 
                      ReceivedByStaffId = {3}, 
                      Status = 1,   
                      OverdueDays = {4}
                  WHERE Id = {5}",
                 returnDate, returnConditionValue, dto.ReturnNotes, dto.ReceivedByStaffId, overdueDays, id);
                        // Update asset
                        var physicalCondition = dto.ReturnCondition.HasValue ? dto.ReturnCondition.Value.ToString() : null;

            await _context.Database.ExecuteSqlRawAsync(
                @"UPDATE Assets 
                  SET Status = 'Available', 
                      PhysicalCondition = COALESCE({0}, PhysicalCondition),
                      UpdatedAt = {1}
                  WHERE Id = {2}",
                physicalCondition, DateTime.UtcNow, assetId);

            return Ok(new
            {
                message = "Equipment returned successfully",
                overdueDays = overdueDays,
                returnDate = returnDate
            });
        }

        // GET: api/Loans/overdue
        [HttpGet("overdue")]
        public async Task<IActionResult> GetOverdueLoans()
        {
            var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();

            using var command = connection.CreateCommand();
            command.CommandText = @"
                SELECT 
                    l.Id,
                    l.AssetId,
                    a.Name as AssetName,
                    l.UserId,
                    CONCAT(u.Fname, ' ', u.Lname) as UserName,
                    l.DueDate,
                    COALESCE(l.OverdueDays, 0) as OverdueDays
                FROM Loans l
                INNER JOIN Assets a ON l.AssetId = a.Id
                INNER JOIN Users u ON l.UserId = u.Id
                WHERE COALESCE(l.Status, 'Active') = 'Active' 
                  AND l.DueDate < NOW()
                ORDER BY l.DueDate ASC";

            var loans = new List<object>();
            using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                loans.Add(new
                {
                    id = reader.GetInt32(0),
                    assetId = reader.GetInt32(1),
                    assetName = reader.GetString(2),
                    userId = reader.GetInt32(3),
                    userName = reader.GetString(4),
                    dueDate = reader.GetDateTime(5),
                    overdueDays = reader.GetInt32(6)
                });
            }

            return Ok(loans);
        }
    }

    // Simple DTOs
    public class LoanSimpleDto
    {
        public int Id { get; set; }
        public int AssetId { get; set; }
        public string AssetName { get; set; }
        public string SerialNumber { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string UserUniversityId { get; set; }
        public DateTime CheckOutDate { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime? ReturnDate { get; set; }
        public string Status { get; set; }
        public int OverdueDays { get; set; }
    }

    public class CreateLoanDto
    {
        public int AssetId { get; set; }
        public int UserId { get; set; }
        public int? ApprovedByStaffId { get; set; }
        public DateTime DueDate { get; set; }
    }

    public class ReturnLoanDto
    {
        public PhysicalCondition? ReturnCondition { get; set; }
        public string ReturnNotes { get; set; }
        public int? ReceivedByStaffId { get; set; }
    }
}

// had to change to this approach becase of mismatch with database
//poor db management or something, kept on having issues with null and null numberable
// difference between sql enums and c# enums major reason on changing to this approach




// to do
// currently shows all loans when loan is being called, need to add filtering for only active loans
//