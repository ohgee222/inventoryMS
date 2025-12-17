using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using InventoryMS.Models.Enums;

namespace InventoryMS.Models.Entities
{
    [Table("AssetHistory")]
    public class AssetHistory
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int AssetId { get; set; }

        [Required]
        public int ChangedBy { get; set; }

        [Required]
        public ChangeType ChangeType { get; set; }

        public string OldValue { get; set; }

        public string NewValue { get; set; }

        public string Notes { get; set; }

        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("AssetId")]
        public virtual Asset Asset { get; set; }

        [ForeignKey("ChangedBy")]
        public virtual Users ChangedByUser { get; set; }
    }
}
