using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using InventoryMS.Models.Enums;

namespace InventoryMS.Models.Entities
{
    [Table("LoanRequests")]
    public class LoanRequest
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int AssetId { get; set; }

        public DateTime RequestDate { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime RequestedStartDate { get; set; }

        [Required]
        public DateTime RequestedEndDate { get; set; }

        public string Purpose { get; set; }

        [Required]
        public LoanRequestStatus Status { get; set; } = LoanRequestStatus.Pending;

        public int ReviewedByStaffId { get; set; }

        public DateTime ReviewedAt { get; set; }

        public string RejectionReason { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual Users User { get; set; }

        [ForeignKey("AssetId")]
        public virtual Asset Asset { get; set; }

        [ForeignKey("ReviewedByStaffId")]
        public virtual Users ReviewedByStaff { get; set; }

        // Computed properties
        [NotMapped]
        public int RequestedDays => (RequestedEndDate - RequestedStartDate).Days;

        [NotMapped]
        public bool IsPending => Status == LoanRequestStatus.Pending;
    }
}
