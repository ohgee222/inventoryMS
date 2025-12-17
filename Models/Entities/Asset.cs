using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using InventoryMS.Models.Enums;

namespace InventoryMS.Models.Entities
{
    [Table("Assets")]
    public class Asset
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [Required]
        public int CategoryId { get; set; }

        [MaxLength(50)]
        public string ItemCondition { get; set; }

        public string Description { get; set; }

        [MaxLength(100)]
        public string SerialNumber { get; set; }

        [Required]
        public AssetStatus Status { get; set; } = AssetStatus.Available;

        [Required]
        public PhysicalCondition PhysicalCondition { get; set; } = PhysicalCondition.Good;

        public DateTime? PurchaseDate { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal? PurchasePrice { get; set; }

        public string Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("CategoryId")]
        public virtual Category Category { get; set; }

        public virtual ICollection<Loan> Loans { get; set; } = new List<Loan>();
        public virtual ICollection<LoanRequest> LoanRequests { get; set; } = new List<LoanRequest>();
        public virtual ICollection<AssetHistory> AssetHistories { get; set; } = new List<AssetHistory>();

        // Computed property
        [NotMapped]
        public bool IsAvailable => Status == AssetStatus.Available &&
                                   PhysicalCondition != PhysicalCondition.InRepair &&
                                   PhysicalCondition != PhysicalCondition.Retired;
    }
}
