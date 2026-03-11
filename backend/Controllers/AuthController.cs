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
using InventoryMS.Helpers;
using InventoryMS.Services;

namespace InventoryMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly InventoryDb _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;

        public AuthController(InventoryDb context, IConfiguration configuration,ILogger<AuthController> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        // POST: api/auth/login
        [HttpPost("login")]
public async Task<IActionResult> Login(LoginDto dto)
{
    // Try to find user by email OR university ID
    var user = await _context.Users
        .FirstOrDefaultAsync(u => u.Email == dto.Identifier || u.UniversityId == dto.Identifier);

    if (user == null)
    {
        return Unauthorized(new { message = "Invalid credentials" });
    }

    // Verify password
    if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
    {
        return Unauthorized(new { message = "Invalid credentials" });
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


             // VALIDATE EMAIL FIRST
            var emailError = EmailValidator.GetEmailError(dto.Email);
            if (emailError != null)
            {
                return BadRequest(new { message = emailError });
            }
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

        // POST: api/Auth/forgot-password
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
        {
            // Validate email
            var emailError = EmailValidator.GetEmailError(dto.Email);
            if (emailError != null)
            {
                // Don't reveal if email exists or not - security best practice
                return Ok(new { message = "If that email exists, a reset link has been sent." });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            
            if (user == null || !user.IsActive)
            {
                // Don't reveal if email exists or not
                return Ok(new { message = "If that email exists, a reset link has been sent." });
            }

            // Generate reset token (6-digit code)
            var resetToken = new Random().Next(100000, 999999).ToString();
            var expiry = DateTime.UtcNow.AddHours(1); // Token expires in 1 hour

            // Save token to database
            await _context.Database.ExecuteSqlRawAsync(
                @"UPDATE Users 
                SET ResetToken = {0}, ResetTokenExpiry = {1}
                WHERE id = {2}",
                resetToken, expiry, user.id);

            // Send email with reset code
            try
            {
                var emailService = HttpContext.RequestServices.GetRequiredService<EmailService>();
                await emailService.SendPasswordResetEmailAsync(
                    toEmail: user.Email,
                    userName: $"{user.Fname} {user.Lname}",
                    resetToken: resetToken
                );
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to send reset email: {ex.Message}");
                return StatusCode(500, new { message = "Failed to send reset email. Please try again." });
            }

            return Ok(new { message = "If that email exists, a reset link has been sent." });
        }

        // POST: api/Auth/reset-password
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto dto)
        {
            // Validate token
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.ResetToken == dto.Token);

            if (user == null)
            {
                return BadRequest(new { message = "Invalid reset token" });
            }

            // Check if token expired
            if (user.ResetTokenExpiry < DateTime.UtcNow)
            {
                return BadRequest(new { message = "Reset token has expired. Please request a new one." });
            }

            // Validate new password (optional - add password strength requirements)
            if (dto.NewPassword.Length < 6)
            {
                return BadRequest(new { message = "Password must be at least 6 characters" });
            }

            // Hash new password
            var newPasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

            // Update password and clear reset token
            await _context.Database.ExecuteSqlRawAsync(
                @"UPDATE Users 
                SET PasswordHash = {0}, 
                    ResetToken = NULL, 
                    ResetTokenExpiry = NULL
                WHERE id = {1}",
                newPasswordHash, user.id);

            return Ok(new { message = "Password reset successfully. You can now login with your new password." });
        }
    }

    // DTOs
  public class LoginDto
{
    public string Identifier { get; set; }  // Changed from Email to Identifier
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
            public class ForgotPasswordDto
        {
            public string Email { get; set; }
        }

        public class ResetPasswordDto
        {
            public string Token { get; set; }
            public string NewPassword { get; set; }
        }
}
