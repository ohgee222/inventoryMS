using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using InventoryMS.Data;
using InventoryMS.Models.Entities;
using InventoryMS.Models.Enums;
using InventoryMS.Controllers;

namespace InventoryMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly InventoryDb _context;
        private readonly IConfiguration _configuration;

        public AuthController(InventoryDb context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            // Find user by email
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            // Verify password
            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            // Check if account is active
            if (!user.IsActive)
            {
                return Unauthorized(new { message = "Account is inactive. Please contact admin." });
            }

            // Update last login
            await _context.Database.ExecuteSqlRawAsync(
                "UPDATE Users SET LastLoginAt = {0} WHERE Id = {1}",
                DateTime.UtcNow, user.id);

            // Generate JWT token
            var token = GenerateJwtToken(user);

            return Ok(new
            {
                token = token,
                userId = user.id,
                email = user.Email,
                fullName = $"{user.Fname} {user.Lname}",
                role = user.Role.ToString(),
                message = "Login successful"
            });
        }

        // POST: api/auth/register (Optional - for creating new accounts)
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            // Check if email already exists
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (existingUser != null)
            {
                return BadRequest(new { message = "Email already exists" });
            }

            // Check if university ID already exists
            var existingUniversityId = await _context.Users
                .FirstOrDefaultAsync(u => u.UniversityId == dto.UniversityId);

            if (existingUniversityId != null)
            {
                return BadRequest(new { message = "University ID already exists" });
            }

            // Hash password
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            // Parse role
            if (!Enum.TryParse<UserRole>(dto.Role, true, out var userRole))
            {
                return BadRequest(new { message = "Invalid role" });
            }

            // Create user
            var createdAt = DateTime.UtcNow;

            await _context.Database.ExecuteSqlRawAsync(
                @"INSERT INTO Users (UniversityId, Email, PasswordHash, Fname, Lname, PhoneNumber, Department, Role, IsActive, CreatedAt)
                  VALUES ({0}, {1}, {2}, {3}, {4}, {5}, {6}, {7}, 1, {8})",
                dto.UniversityId, dto.Email, passwordHash, dto.Fname, dto.Lname,
                dto.PhoneNumber, dto.Department, (int)userRole, createdAt);

            return Ok(new
            {
                message = "User registered successfully",
                email = dto.Email,
                role = userRole.ToString()
            });
        }

        // Helper method to generate JWT token
        private string GenerateJwtToken(Users user)
        {
            var securityKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));

            var credentials = new SigningCredentials(
                securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim(ClaimTypes.Name, $"{user.Fname} {user.Lname}"),
                new Claim("UniversityId", user.UniversityId)
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(
                    Convert.ToDouble(_configuration["Jwt:ExpiresInHours"])),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    // DTOs
    public class LoginDto
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class RegisterDto
    {
        public string UniversityId { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Fname { get; set; }
        public string Lname { get; set; }
        public string PhoneNumber { get; set; }
        public string Department { get; set; }
        public string Role { get; set; }  // "Admin", "Staff", or "Student"
    }
}
