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

        // GET: api/Loans
        [HttpGet]
        public async Task<ActionResult<IEnumerable<LoanResponseDto>>> GetLoans([FromQuery] string status = null)
        {
            var query = _context.Loans
                .Include(l => l.User)
                .Include(l => l.Asset)
                    .ThenInclude(a => a.Category)
                .Include(l => l.ApprovedByStaff)
                .AsQueryable();

            // Filter by status if provided
            if (!string.IsNullOrEmpty(status))
            {
                if (Enum.TryParse<LoanStatus>(status, true, out var loanStatus))
                {
                    query = query.Where(l => l.Status == loanStatus);
                }
            }

            var loans = await query
                .OrderByDescending(l => l.CheckOutDate)
                .Select(l => new LoanResponseDto
                {
                    Id = l.Id,
                    AssetId = l.AssetId,
                    AssetName = l.Asset.Name,
                    SerialNumber = l.Asset.SerialNumber,
                    UserId = l.UserId,
                    UserName = l.User.FullName,
                    UserUniversityId = l.User.UniversityId,
                    ApprovedByStaffId = l.ApprovedByStaffId,
                    ApprovedByStaffName = l.ApprovedByStaff != null ? l.ApprovedByStaff.FullName : null,
                    CheckOutDate = l.CheckOutDate,
                    DueDate = l.DueDate,
                    ReturnDate = l.ReturnDate,
                    ReturnCondition = l.ReturnCondition.HasValue ? l.ReturnCondition.Value.ToString() : null,
                    ReturnNotes = l.ReturnNotes,
                    OverdueDays = l.OverdueDays,
                    Status = l.Status.ToString(),
                    IsOverdue = l.IsOverdue,
                    DaysUntilDue = l.DaysUntilDue
                })
                .ToListAsync();

            return Ok(loans);
        }

        // GET: api/Loans/5
        // build teh query with all related data, borrower info, asset info, asset category and staff who approved
        [HttpGet("{id}")]
        public async Task<ActionResult<LoanResponseDto>> GetLoan(int id)
        {
            var loan = await _context.Loans
                .Include(l => l.User)
                .Include(l => l.Asset)
                    .ThenInclude(a => a.Category)
                .Include(l => l.ApprovedByStaff)
                .Include(l => l.ReceivedByStaff)
                .Where(l => l.Id == id)
                .Select(l => new LoanResponseDto
                {
                    Id = l.Id,
                    AssetId = l.AssetId,
                    AssetName = l.Asset.Name,
                    SerialNumber = l.Asset.SerialNumber,
                    UserId = l.UserId,
                    UserName = l.User.FullName,
                    UserUniversityId = l.User.UniversityId,
                    ApprovedByStaffId = l.ApprovedByStaffId,
                    ApprovedByStaffName = l.ApprovedByStaff != null ? l.ApprovedByStaff.FullName : null,
                    CheckOutDate = l.CheckOutDate,
                    DueDate = l.DueDate,
                    ReturnDate = l.ReturnDate,
                    ReturnCondition = l.ReturnCondition.HasValue ? l.ReturnCondition.Value.ToString() : null,
                    ReturnNotes = l.ReturnNotes,
                    OverdueDays = l.OverdueDays,
                    ReceivedByStaffName = l.ReceivedByStaff != null ? l.ReceivedByStaff.FullName : null,
                    Status = l.Status.ToString(),
                    IsOverdue = l.IsOverdue,
                    DaysUntilDue = l.DaysUntilDue
                })
                .FirstOrDefaultAsync();

            if (loan == null)
            {
                return NotFound(new { message = $"Loan with ID {id} not found" });
            }

            return Ok(loan);
        }

        // POST: api/Loans (Check out equipment)
        [HttpPost]
        public async Task<ActionResult<LoanResponseDto>> CreateLoan(CreateLoanDto dto)
        {
            // Validate asset exists
            var asset = await _context.Assets.FindAsync(dto.AssetId);
            if (asset == null)
            {
                return BadRequest(new { message = "Asset not found" });
            }

            // Check if asset is available
            if (asset.Status != AssetStatus.Available)
            {
                return BadRequest(new { message = $"Asset is not available. Current status: {asset.Status}" });
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

            // Validate staff exists if provided
            if (dto.ApprovedByStaffId.HasValue)
            {
                var staff = await _context.Users.FindAsync(dto.ApprovedByStaffId.Value);
                if (staff == null || (staff.Role != UserRole.Staff && staff.Role != UserRole.Admin))
                {
                    return BadRequest(new { message = "Invalid staff member" });
                }
            }

            // Create the loan
            var loan = new Loan
            {
                AssetId = dto.AssetId,
                UserId = dto.UserId,
                ApprovedByStaffId = dto.ApprovedByStaffId,
                CheckOutDate = DateTime.UtcNow,
                DueDate = dto.DueDate,
                Status = LoanStatus.Active,
                CreatedAt = DateTime.UtcNow
            };

            // Update asset status
            asset.Status = AssetStatus.CheckedOut;
            asset.UpdatedAt = DateTime.UtcNow;

            _context.Loans.Add(loan);
            await _context.SaveChangesAsync();

            // Reload with includes for response
            var createdLoan = await _context.Loans
                .Include(l => l.User)
                .Include(l => l.Asset)
                .Include(l => l.ApprovedByStaff)
                .FirstOrDefaultAsync(l => l.Id == loan.Id);

            var response = new LoanResponseDto
            {
                Id = createdLoan.Id,
                AssetId = createdLoan.AssetId,
                AssetName = createdLoan.Asset.Name,
                SerialNumber = createdLoan.Asset.SerialNumber,
                UserId = createdLoan.UserId,
                UserName = createdLoan.User.FullName,
                UserUniversityId = createdLoan.User.UniversityId,
                ApprovedByStaffId = createdLoan.ApprovedByStaffId,
                ApprovedByStaffName = createdLoan.ApprovedByStaff?.FullName,
                CheckOutDate = createdLoan.CheckOutDate,
                DueDate = createdLoan.DueDate,
                Status = createdLoan.Status.ToString()
            };

            return CreatedAtAction(nameof(GetLoan), new { id = loan.Id }, response);
        }

        // PUT: api/Loans/5/return (Return equipment)
        [HttpPut("{id}/return")]
        public async Task<IActionResult> ReturnLoan(int id, ReturnLoanDto dto)
        {
            var loan = await _context.Loans
                .Include(l => l.Asset)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (loan == null)
            {
                return NotFound(new { message = $"Loan with ID {id} not found" });
            }

            if (loan.Status != LoanStatus.Active)
            {
                return BadRequest(new { message = $"Loan is not active. Current status: {loan.Status}" });
            }

            // Validate staff member if provided
            if (dto.ReceivedByStaffId.HasValue)
            {
                var staff = await _context.Users.FindAsync(dto.ReceivedByStaffId.Value);
                if (staff == null || (staff.Role != UserRole.Staff && staff.Role != UserRole.Admin))
                {
                    return BadRequest(new { message = "Invalid staff member" });
                }
            }

            // Update loan
            loan.ReturnDate = DateTime.UtcNow;
            loan.ReturnCondition = dto.ReturnCondition;
            loan.ReturnNotes = dto.ReturnNotes;
            loan.ReceivedByStaffId = dto.ReceivedByStaffId;
            loan.Status = LoanStatus.Returned;

            // Calculate overdue days
            if (loan.ReturnDate > loan.DueDate)
            {
                loan.OverdueDays = (loan.ReturnDate.Value - loan.DueDate).Days;
            }

            // Update asset status and condition
            loan.Asset.Status = AssetStatus.Available;
            if (dto.ReturnCondition.HasValue)
            {
                loan.Asset.PhysicalCondition = dto.ReturnCondition.Value;
            }
            loan.Asset.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Equipment returned successfully",
                overdueDays = loan.OverdueDays,
                returnDate = loan.ReturnDate
            });
        }

        // GET: api/Loans/overdue
        [HttpGet("overdue")]
        public async Task<ActionResult<IEnumerable<LoanResponseDto>>> GetOverdueLoans()
        {
            var overdueLoans = await _context.Loans
                .Include(l => l.User)
                .Include(l => l.Asset)
                    .ThenInclude(a => a.Category)
                .Where(l => l.Status == LoanStatus.Active && l.DueDate < DateTime.UtcNow)
                .OrderBy(l => l.DueDate)
                .Select(l => new LoanResponseDto
                {
                    Id = l.Id,
                    AssetId = l.AssetId,
                    AssetName = l.Asset.Name,
                    SerialNumber = l.Asset.SerialNumber,
                    UserId = l.UserId,
                    UserName = l.User.FullName,
                    UserUniversityId = l.User.UniversityId,
                    CheckOutDate = l.CheckOutDate,
                    DueDate = l.DueDate,
                    Status = l.Status.ToString(),
                    IsOverdue = true,
                    DaysUntilDue = l.DaysUntilDue
                })
                .ToListAsync();

            return Ok(overdueLoans);
        }
    }

    // DTOs
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

    public class LoanResponseDto
    {
        public int Id { get; set; }
        public int AssetId { get; set; }
        public string AssetName { get; set; }
        public string SerialNumber { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string UserUniversityId { get; set; }
        public int? ApprovedByStaffId { get; set; }
        public string ApprovedByStaffName { get; set; }
        public DateTime CheckOutDate { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime? ReturnDate { get; set; }
        public string ReturnCondition { get; set; }
        public string ReturnNotes { get; set; }
        public int OverdueDays { get; set; }
        public string ReceivedByStaffName { get; set; }
        public string Status { get; set; }
        public bool IsOverdue { get; set; }
        public int DaysUntilDue { get; set; }
    }
}
