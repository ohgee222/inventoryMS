using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InventoryMS.Data;
using InventoryMS.Models.Entities;
using InventoryMS.Models.Enums;
using BCrypt.Net;

namespace InventoryMS.Controllers
{
    [Route("api/[controller]")] // create the controller api
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly InventoryDb _context;

        public UsersController(InventoryDb context)
        {
            _context = context;
        }

        // GET: api/Users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetUsers()
        {
            //query database for all active users
            var users = await _context.Users
                .Where(u => u.IsActive)
                .Select(u => new UserResponseDto
                {
                    Id = u.id,
                    Fname = u.Fname,
                    Lname = u.Lname,
                    FullName = u.FullName,
                    UniversityId = u.UniversityId,
                    Role = u.Role.ToString(),
                    Email = u.Email,
                    PhoneNumber = u.PhoneNumber,
                    Department = u.Department,
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();//execute the query and return as list

            return Ok(users);
        }
        // to get single user
        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserResponseDto>> GetUser(int id)
        {
            // find user by id
            var user = await _context.Users
                .Where(u => u.id == id)
                .Select(u => new UserResponseDto
                {
                    Id = u.id,
                    Fname = u.Fname,
                    Lname = u.Lname,
                    FullName = u.FullName,
                    UniversityId = u.UniversityId,
                    Role = u.Role.ToString(),
                    Email = u.Email,
                    PhoneNumber = u.PhoneNumber,
                    Department = u.Department,
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new { message = $"User with ID {id} not found" });
            }

            return Ok(user);
        }

        //create User
        // POST: api/Users
        [HttpPost]
        public async Task<ActionResult<UserResponseDto>> CreateUser(CreateUserDto dto)
        {
            // Check if university ID already exists
            if (await _context.Users.AnyAsync(u => u.UniversityId == dto.UniversityId))
            {
                return BadRequest(new { message = "University ID already exists" });
            }

            // Check if email already exists
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            {
                return BadRequest(new { message = "Email already exists" });
            }

            // Hash the password for security
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var user = new Users
            {
                Fname = dto.Fname,
                Lname = dto.Lname,
                UniversityId = dto.UniversityId,
                Role = dto.Role,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                Department = dto.Department,
                PasswordHash = passwordHash,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            //save to the database
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            //coonvert responsen dto without password
            var response = new UserResponseDto
            {
                Id = user.id,
                Fname = user.Fname,
                Lname = user.Lname,
                FullName = user.FullName,
                UniversityId = user.UniversityId,
                Role = user.Role.ToString(),
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Department = user.Department,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            };

            return CreatedAtAction(nameof(GetUser), new { id = user.id }, response);
        }

        // PUT: api/Users/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UpdateUserDto dto)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound(new { message = $"User with ID {id} not found" });
            }

            // Update fields if provided
            if (!string.IsNullOrEmpty(dto.Fname))
                user.Fname = dto.Fname;

            if (!string.IsNullOrEmpty(dto.Lname))
                user.Lname = dto.Lname;

            if (!string.IsNullOrEmpty(dto.Email))
            {
                // Check if new email is taken by another user
                if (await _context.Users.AnyAsync(u => u.Email == dto.Email && u.id != id))
                {
                    return BadRequest(new { message = "Email already in use" });
                }
                user.Email = dto.Email;
            }

            if (!string.IsNullOrEmpty(dto.PhoneNumber))
                user.PhoneNumber = dto.PhoneNumber;

            if (!string.IsNullOrEmpty(dto.Department))
                user.Department = dto.Department;

            if (dto.Role.HasValue)
                user.Role = dto.Role.Value;

            if (dto.IsActive.HasValue)
                user.IsActive = dto.IsActive.Value;

            // Update password if provided
            if (!string.IsNullOrEmpty(dto.Password))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            }

            await _context.SaveChangesAsync();

            var response = new UserResponseDto
            {
                Id = user.id,
                Fname = user.Fname,
                Lname = user.Lname,
                FullName = user.FullName,
                UniversityId = user.UniversityId,
                Role = user.Role.ToString(),
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Department = user.Department,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            };

            return Ok(response);
        }

        // DELETE: api/Users/5 (Soft delete - sets IsActive to false)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound(new { message = $"User with ID {id} not found" });
            }

            // Soft delete - just mark as inactive
            user.IsActive = false;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"User {user.FullName} deactivated successfully" });
        }
    }

    // DTOs
    public class CreateUserDto
    {
        public string Fname { get; set; }
        public string Lname { get; set; }
        public string UniversityId { get; set; }
        public UserRole Role { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Department { get; set; }
        public string Password { get; set; }
    }

    public class UpdateUserDto
    {
        public string Fname { get; set; }
        public string Lname { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Department { get; set; }
        public UserRole? Role { get; set; }
        public bool? IsActive { get; set; }
        public string Password { get; set; }
    }

    public class UserResponseDto
    {
        public int Id { get; set; }
        public string Fname { get; set; }
        public string Lname { get; set; }
        public string FullName { get; set; }
        public string UniversityId { get; set; }
        public string Role { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Department { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}