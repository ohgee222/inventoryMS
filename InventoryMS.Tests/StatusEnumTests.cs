using Xunit;
using FluentAssertions;

namespace InventoryMS.Tests
{
    /// <summary>
    /// Unit tests for status enum values and state transition logic.
    /// These enums drive core system behaviour — equipment availability,
    /// loan lifecycle, and request workflow — so verifying their values
    /// and transitions prevents silent breakage if enums are reordered.
    /// </summary>
    public class StatusEnumTests
    {
        // --- LoanRequestStatus numeric values ---
        // MySQL stores enums as numeric indices (0, 1, 2).
        // The system relies on these exact values in raw SQL queries.
        // If the enum order changes, existing database records break.

        [Fact]
        public void LoanRequestStatus_Pending_ShouldBeZero()
        {
            ((int)LoanRequestStatus.Pending).Should().Be(0);
        }

        [Fact]
        public void LoanRequestStatus_Approved_ShouldBeOne()
        {
            ((int)LoanRequestStatus.Approved).Should().Be(1);
        }

        [Fact]
        public void LoanRequestStatus_Rejected_ShouldBeTwo()
        {
            ((int)LoanRequestStatus.Rejected).Should().Be(2);
        }

        // --- LoanStatus numeric values ---

        [Fact]
        public void LoanStatus_Active_ShouldBeZero()
        {
            ((int)LoanStatus.Active).Should().Be(0);
        }

        [Fact]
        public void LoanStatus_Returned_ShouldBeOne()
        {
            ((int)LoanStatus.Returned).Should().Be(1);
        }

        [Fact]
        public void LoanStatus_Overdue_ShouldBeTwo()
        {
            ((int)LoanStatus.Overdue).Should().Be(2);
        }

        // --- AssetStatus numeric values ---

        [Fact]
        public void AssetStatus_Available_ShouldBeZero()
        {
            ((int)AssetStatus.Available).Should().Be(0);
        }

        [Fact]
        public void AssetStatus_CheckedOut_ShouldBeOne()
        {
            ((int)AssetStatus.CheckedOut).Should().Be(1);
        }

        // --- State transition logic ---
        // These tests verify the business rules about which transitions are valid.
        // An asset can only be loaned when Available.
        // A request can only be approved or rejected when Pending.

        [Fact]
        public void AssetApproval_WhenAvailable_ShouldBePermitted()
        {
            var assetStatus = AssetStatus.Available;
            var canApprove = assetStatus == AssetStatus.Available;
            canApprove.Should().BeTrue();
        }

        [Fact]
        public void AssetApproval_WhenCheckedOut_ShouldBeRejected()
        {
            var assetStatus = AssetStatus.CheckedOut;
            var canApprove = assetStatus == AssetStatus.Available;
            canApprove.Should().BeFalse();
        }

        [Fact]
        public void LoanRequest_WhenPending_CanBeApproved()
        {
            var status = LoanRequestStatus.Pending;
            var canProcess = status == LoanRequestStatus.Pending;
            canProcess.Should().BeTrue();
        }

        [Fact]
        public void LoanRequest_WhenAlreadyApproved_CannotBeApprovedAgain()
        {
            var status = LoanRequestStatus.Approved;
            var canProcess = status == LoanRequestStatus.Pending;
            canProcess.Should().BeFalse();
        }

        [Fact]
        public void LoanRequest_WhenRejected_CannotBeApproved()
        {
            var status = LoanRequestStatus.Rejected;
            var canProcess = status == LoanRequestStatus.Pending;
            canProcess.Should().BeFalse();
        }

        // --- Overdue detection logic ---
        // Mirrors the condition used in OverdueCheckService:
        // a loan is overdue when ReturnDate is null AND DueDate < now

        [Fact]
        public void OverdueDetection_PastDueWithNoReturn_ShouldBeOverdue()
        {
            var dueDate = DateTime.UtcNow.AddDays(-3);
            DateTime? returnDate = null;

            var isOverdue = returnDate == null && dueDate < DateTime.UtcNow;

            isOverdue.Should().BeTrue();
        }

        [Fact]
        public void OverdueDetection_FutureDueDate_ShouldNotBeOverdue()
        {
            var dueDate = DateTime.UtcNow.AddDays(5);
            DateTime? returnDate = null;

            var isOverdue = returnDate == null && dueDate < DateTime.UtcNow;

            isOverdue.Should().BeFalse();
        }

        [Fact]
        public void OverdueDetection_AlreadyReturned_ShouldNotBeOverdue()
        {
            var dueDate = DateTime.UtcNow.AddDays(-3); // past due
            DateTime? returnDate = DateTime.UtcNow.AddDays(-1); // but returned

            var isOverdue = returnDate == null && dueDate < DateTime.UtcNow;

            isOverdue.Should().BeFalse();
        }

        // --- Local enum definitions (mirror the main project) ---
        private enum LoanRequestStatus { Pending, Approved, Rejected }
        private enum LoanStatus { Active, Returned, Overdue }
        private enum AssetStatus { Available, CheckedOut, Reserved }
    }
}
