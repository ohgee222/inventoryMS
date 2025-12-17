using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using InventoryMS.Models.Enums;

namespace InventoryMS.Models.Entities
{
    [Table("Loans")]
    public class Loan
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int AssetId { get; set; }

        [Required]
        public int UserId { get; set; }

        public int? ApprovedByStaffId { get; set; }

        [Required]
        public DateTime CheckOutDate { get; set; }

        [Required]
        public DateTime DueDate { get; set; }

        public DateTime? ReturnDate { get; set; }

        public PhysicalCondition? ReturnCondition { get; set; }

        public string ReturnNotes { get; set; }

        public int OverdueDays { get; set; } = 0;

        public int? ReceivedByStaffId { get; set; }

        [Required]
        public LoanStatus Status { get; set; } = LoanStatus.Active;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("AssetId")]
        public virtual Asset Asset { get; set; }

        [ForeignKey("UserId")]
        public virtual Users User { get; set; }

        [ForeignKey("ApprovedByStaffId")]
        public virtual Users ApprovedByStaff { get; set; }

        [ForeignKey("ReceivedByStaffId")]
        public virtual Users ReceivedByStaff { get; set; }

        public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

        // Computed properties
        [NotMapped]
        public bool IsOverdue => Status == LoanStatus.Active && DateTime.UtcNow > DueDate;

        [NotMapped]
        public int DaysUntilDue => (DueDate - DateTime.UtcNow).Days;

        [NotMapped]
        public bool IsDueSoon => Status == LoanStatus.Active && DaysUntilDue <= 2 && DaysUntilDue >= 0;
    }
}
