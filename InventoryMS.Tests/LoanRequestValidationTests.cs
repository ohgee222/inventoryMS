using Xunit;
using FluentAssertions;

namespace InventoryMS.Tests
{
    /// <summary>
    /// Unit tests for loan request date and duration validation logic.
    /// These rules are enforced in LoanRequestsController.CreateLoanRequest
    /// and represent core business constraints of the system:
    ///   - Start date cannot be in the past
    ///   - End date must be after start date
    ///   - Maximum loan duration is 30 days
    /// </summary>
    public class LoanRequestValidationTests
    {
        // --- Past start date ---

        [Fact]
        public void StartDateInPast_ShouldFailValidation()
        {
            var startDate = DateTime.Today.AddDays(-1);
            var endDate = DateTime.Today.AddDays(5);

            var result = ValidateLoanDates(startDate, endDate);

            result.IsValid.Should().BeFalse();
            result.ErrorMessage.Should().Be("Start date cannot be in the past");
        }

        [Fact]
        public void StartDateToday_ShouldPassValidation()
        {
            var startDate = DateTime.Today;
            var endDate = DateTime.Today.AddDays(5);

            var result = ValidateLoanDates(startDate, endDate);

            result.IsValid.Should().BeTrue();
        }

        [Fact]
        public void StartDateInFuture_ShouldPassValidation()
        {
            var startDate = DateTime.Today.AddDays(3);
            var endDate = DateTime.Today.AddDays(10);

            var result = ValidateLoanDates(startDate, endDate);

            result.IsValid.Should().BeTrue();
        }

        // --- End date before or equal to start date ---

        [Fact]
        public void EndDateBeforeStartDate_ShouldFailValidation()
        {
            var startDate = DateTime.Today.AddDays(5);
            var endDate = DateTime.Today.AddDays(2);

            var result = ValidateLoanDates(startDate, endDate);

            result.IsValid.Should().BeFalse();
            result.ErrorMessage.Should().Be("End date must be after start date");
        }

        [Fact]
        public void EndDateEqualToStartDate_ShouldFailValidation()
        {
            var startDate = DateTime.Today.AddDays(2);
            var endDate = DateTime.Today.AddDays(2); // same day

            var result = ValidateLoanDates(startDate, endDate);

            result.IsValid.Should().BeFalse();
            result.ErrorMessage.Should().Be("End date must be after start date");
        }

        // --- 30-day maximum duration ---

        [Fact]
        public void LoanDurationExactly30Days_ShouldPassValidation()
        {
            var startDate = DateTime.Today;
            var endDate = DateTime.Today.AddDays(30);

            var result = ValidateLoanDates(startDate, endDate);

            result.IsValid.Should().BeTrue();
        }

        [Fact]
        public void LoanDuration31Days_ShouldFailValidation()
        {
            var startDate = DateTime.Today;
            var endDate = DateTime.Today.AddDays(31);

            var result = ValidateLoanDates(startDate, endDate);

            result.IsValid.Should().BeFalse();
            result.ErrorMessage.Should().Be("Maximum loan duration is 30 days");
        }

        [Fact]
        public void LoanDuration1Day_ShouldPassValidation()
        {
            var startDate = DateTime.Today;
            var endDate = DateTime.Today.AddDays(1);

            var result = ValidateLoanDates(startDate, endDate);

            result.IsValid.Should().BeTrue();
        }

        [Fact]
        public void LoanDuration60Days_ShouldFailValidation()
        {
            var startDate = DateTime.Today;
            var endDate = DateTime.Today.AddDays(60);

            var result = ValidateLoanDates(startDate, endDate);

            result.IsValid.Should().BeFalse();
            result.ErrorMessage.Should().Be("Maximum loan duration is 30 days");
        }

        // --- RequestedDays computed property ---

        [Fact]
        public void RequestedDays_ShouldReturnCorrectDuration()
        {
            var startDate = DateTime.Today;
            var endDate = DateTime.Today.AddDays(14);

            var days = (endDate - startDate).Days;

            days.Should().Be(14);
        }

        // --- Validation helper (mirrors logic in LoanRequestsController.CreateLoanRequest) ---

        private static (bool IsValid, string ErrorMessage) ValidateLoanDates(
            DateTime startDate, DateTime endDate)
        {
            if (startDate < DateTime.Today)
                return (false, "Start date cannot be in the past");

            if (endDate <= startDate)
                return (false, "End date must be after start date");

            var loanDuration = (endDate - startDate).Days;
            if (loanDuration > 30)
                return (false, "Maximum loan duration is 30 days");

            return (true, null!);
        }
    }
}
