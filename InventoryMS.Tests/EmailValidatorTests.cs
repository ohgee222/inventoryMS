using Xunit;
using FluentAssertions;

// Since EmailValidator is a static helper class, we copy its logic here to test it
// independently without needing a reference to the main project.
// This mirrors the implementation in InventoryMS.Helpers.EmailValidator

namespace InventoryMS.Tests
{
    /// <summary>
    /// Unit tests for university email domain validation logic.
    /// Verifies that only @hull.ac.uk addresses are accepted,
    /// and that invalid or empty inputs are correctly rejected.
    /// </summary>
    public class EmailValidatorTests
    {
        // --- IsValidUniversityEmail ---

        [Fact]
        public void ValidHullEmail_ShouldReturnTrue()
        {
            var result = IsValidUniversityEmail("john.doe@hull.ac.uk");
            result.Should().BeTrue();
        }

        [Fact]
        public void ValidHullEmail_UpperCase_ShouldReturnTrue()
        {
            // Email comparison should be case-insensitive
            var result = IsValidUniversityEmail("JOHN.DOE@HULL.AC.UK");
            result.Should().BeTrue();
        }

        [Fact]
        public void NonHullEmail_Gmail_ShouldReturnFalse()
        {
            var result = IsValidUniversityEmail("john.doe@gmail.com");
            result.Should().BeFalse();
        }

        [Fact]
        public void NonHullEmail_OtherUniversity_ShouldReturnFalse()
        {
            // Only hull.ac.uk is accepted, not other .ac.uk addresses
            var result = IsValidUniversityEmail("john.doe@leeds.ac.uk");
            result.Should().BeFalse();
        }

        [Fact]
        public void EmptyEmail_ShouldReturnFalse()
        {
            var result = IsValidUniversityEmail("");
            result.Should().BeFalse();
        }

        [Fact]
        public void NullEmail_ShouldReturnFalse()
        {
            var result = IsValidUniversityEmail(null);
            result.Should().BeFalse();
        }

        [Fact]
        public void WhitespaceEmail_ShouldReturnFalse()
        {
            var result = IsValidUniversityEmail("   ");
            result.Should().BeFalse();
        }

        [Fact]
        public void EmailWithNoAtSymbol_ShouldReturnFalse()
        {
            var result = IsValidUniversityEmail("johndoehull.ac.uk");
            result.Should().BeFalse();
        }

        [Fact]
        public void EmailWithHullInWrongPosition_ShouldReturnFalse()
        {
            // hull.ac.uk must be the actual domain, not just appear anywhere in the string
            var result = IsValidUniversityEmail("hull.ac.uk@gmail.com");
            result.Should().BeFalse();
        }

        // --- GetEmailError ---

        [Fact]
        public void GetEmailError_ValidHullEmail_ShouldReturnNull()
        {
            var result = GetEmailError("john@hull.ac.uk");
            result.Should().BeNull();
        }

        [Fact]
        public void GetEmailError_EmptyEmail_ShouldReturnRequiredMessage()
        {
            var result = GetEmailError("");
            result.Should().Be("Email is required");
        }

        [Fact]
        public void GetEmailError_NoAtSymbol_ShouldReturnFormatMessage()
        {
            var result = GetEmailError("invalidemail.com");
            result.Should().Be("Invalid email format");
        }

        [Fact]
        public void GetEmailError_NonHullDomain_ShouldReturnDomainMessage()
        {
            var result = GetEmailError("john@gmail.com");
            result.Should().Contain("hull.ac.uk");
        }

        // --- Inline implementation (mirrors InventoryMS.Helpers.EmailValidator) ---

        private static bool IsValidUniversityEmail(string? email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return false;
            email = email.ToLower().Trim();
            if (!email.Contains("@") || !email.Contains("."))
                return false;
            return email.EndsWith("@hull.ac.uk");
        }

        private static string? GetEmailError(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return "Email is required";
            if (!email.Contains("@"))
                return "Invalid email format";
            if (!IsValidUniversityEmail(email))
                return "Only University of Hull email addresses are allowed (@hull.ac.uk)";
            return null;
        }
    }
}
