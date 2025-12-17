using System;
using System.ComponentModel.DataAnnotations;
namespace InventoryMS.Models.Entities
{
	public class Users
	{
		public int id { get; set; }
        public string Fname { get; set; }
        public string Lname { get; set; }
        public string UniversityId { get; set; }//student number or staff number
        public string Role { get; set; }
        public string Email { get; set; }
		public string PasswordHash { get; set; }
		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
	}
}

