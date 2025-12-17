using Microsoft.EntityFrameworkCore;
using InventoryMS.Models.Entities;

namespace InventoryMS.Data
{
    public class DatabaseDb : DbContext
    {
        public DatabaseDb(DbContextOptions<DatabaseDb> options)
            : base(options)
        {
        }

        public DbSet<Users> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Make Email unique
            modelBuilder.Entity<Users>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Make UniversityId unique
            modelBuilder.Entity<Users>()
                .HasIndex(u => u.UniversityId)
                .IsUnique();
        }
    }

}