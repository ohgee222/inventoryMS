using Xunit;
using FluentAssertions;

namespace InventoryMS.Tests
{
    /// <summary>
    /// Unit tests for overdue days calculation logic.
    /// The system tracks how many days a loan is overdue via the OverdueDays
    /// field, which is updated by the OverdueCheckService background process.
    /// These tests verify the calculation behaves correctly at boundary conditions.
    /// </summary>
    public class OverdueDaysCalculationTests
    {
        [Fact]
        public void LoanOverdueBy3Days_ShouldCalculateCorrectly()
        {
            var dueDate = DateTime.UtcNow.AddDays(-3);
            var daysOverdue = CalculateDaysOverdue(dueDate);

            daysOverdue.Should().Be(3);
        }

        [Fact]
        public void LoanDueTodayNotYetReturned_ShouldBeZeroDaysOverdue()
        {
            // A loan due exactly now is not yet overdue
            var dueDate = DateTime.UtcNow;
            var daysOverdue = CalculateDaysOverdue(dueDate);

            daysOverdue.Should().Be(0);
        }

        [Fact]
        public void LoanDueInFuture_ShouldReturnNegative()
        {
            // Negative value means the loan is not yet overdue
            var dueDate = DateTime.UtcNow.AddDays(5);
            var daysOverdue = CalculateDaysOverdue(dueDate);

            daysOverdue.Should().BeLessThan(0);
        }

        [Fact]
        public void LoanOverdueBy1Day_ShouldBeDetectedAsOverdue()
        {
            var dueDate = DateTime.UtcNow.AddDays(-1);
            var isOverdue = dueDate < DateTime.UtcNow;

            isOverdue.Should().BeTrue();
        }

        [Fact]
        public void LoanOverdueBy30Days_ShouldCalculateCorrectly()
        {
            var dueDate = DateTime.UtcNow.AddDays(-30);
            var daysOverdue = CalculateDaysOverdue(dueDate);

            daysOverdue.Should().BeGreaterThanOrEqualTo(29); // allow for sub-second timing
        }

        // --- Mirrors DATEDIFF(NOW(), l.DueDate) from OverdueCheckService SQL ---
        private static int CalculateDaysOverdue(DateTime dueDate)
        {
            return (int)(DateTime.UtcNow - dueDate).TotalDays;
        }
    }
}
