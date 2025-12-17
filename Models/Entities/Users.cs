using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using InventoryMS.Models.Enums;
namespace InventoryMS.Models.Entities
{
    [Table("Users")]
	public class Users
	{
        [Key]
		public int id { get; set; }

        [Required]
        [MaxLength(120)]
        public string Fname { get; set; }

        [Required]
        [MaxLength(120)]
        public string Lname { get; set; }

        [Required]
        [MaxLength(50)]
        public string UniversityId { get; set; }//student number or staff number

        [Required]
        public UserRole Role { get; set; }

        [Required]
        [MaxLength(150)]
        [EmailAddress]
        public string Email { get; set; }

        [MaxLength(20)]
        public string PhoneNumber { get; set; }


        [MaxLength(100)]
        public string Department { get; set; }

        [Required]
        [MaxLength(255)]
        public string PasswordHash { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime? LastLoginAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Computed property for display
        [NotMapped]
        public string FullName => $"{Fname} {Lname}";




        // Navigation properties
        public virtual ICollection<Loan> Loans { get; set; } = new List<Loan>();
        public virtual ICollection<LoanRequest> LoanRequests { get; set; } = new List<LoanRequest>();
        public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
        public virtual ICollection<Loan> ApprovedLoans { get; set; } = new List<Loan>();
        public virtual ICollection<Loan> ReceivedLoans { get; set; } = new List<Loan>();
        public virtual ICollection<AssetHistory> AssetHistories { get; set; } = new List<AssetHistory>();
    }
}

