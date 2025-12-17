using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using InventoryMS.Models.Enums;

namespace InventoryMS.Models.Entities
{
    [Table("Notifications")]
    public class Notification
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(500)]
        public string Message { get; set; }

        [Required]
        public NotificationType Type { get; set; }

        public bool IsRead { get; set; } = false;

        public DateTime? ReadAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int? RelatedLoanId { get; set; }

        public int? RelatedAssetId { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual Users User { get; set; }

        [ForeignKey("RelatedLoanId")]
        public virtual Loan RelatedLoan { get; set; }

        [ForeignKey("RelatedAssetId")]
        public virtual Asset RelatedAsset { get; set; }
    }
}
