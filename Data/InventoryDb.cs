using Microsoft.EntityFrameworkCore;
using InventoryMS.Models.Entities;
using InventoryMS.Models.Enums;

namespace InventoryMS.Data
{
    public class InventoryDb : DbContext
    {
        public InventoryDb(DbContextOptions<InventoryDb> options)
            : base(options)
        {
        }

        // DbSets - These represent your database tables
        public DbSet<Asset> Assets { get; set; }
        public DbSet<Users> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Loan> Loans { get; set; }
        public DbSet<LoanRequest> LoanRequests { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<AssetHistory> AssetHistories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ===================================
            // ENUM TO STRING CONVERSIONS
            // ===================================
            modelBuilder.Entity<Users>()
                .Property(u => u.Role)
                .HasConversion<string>();

            modelBuilder.Entity<Asset>()
                .Property(a => a.Status)
                .HasConversion<string>();

            modelBuilder.Entity<Asset>()
                .Property(a => a.PhysicalCondition)
                .HasConversion<string>();

            modelBuilder.Entity<LoanRequest>()
                .Property(lr => lr.Status)
                .HasConversion<string>();

            modelBuilder.Entity<Loan>()
                .Property(l => l.Status)
                .HasConversion<string>();

            modelBuilder.Entity<Loan>()
                .Property(l => l.ReturnCondition)
                .HasConversion<string>();

            modelBuilder.Entity<Notification>()
                .Property(n => n.Type)
                .HasConversion<string>();

            modelBuilder.Entity<AssetHistory>()
                .Property(ah => ah.ChangeType)
                .HasConversion<string>();

            // ===================================
            // INDEXES
            // ===================================
            modelBuilder.Entity<Users>().HasIndex(u => u.UniversityId).IsUnique();
            modelBuilder.Entity<Users>().HasIndex(u => u.Email).IsUnique();
            modelBuilder.Entity<Asset>().HasIndex(a => a.SerialNumber).IsUnique();

            // ===================================
            // RELATIONSHIPS - THIS IS THE FIX
            // ===================================

            // Asset -> Category
            modelBuilder.Entity<Asset>()
                .HasOne(a => a.Category)
                .WithMany(c => c.Assets)
                .HasForeignKey(a => a.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // Loan -> User (borrower)
            modelBuilder.Entity<Loan>()
                .HasOne(l => l.User)
                .WithMany(u => u.Loans)
                .HasForeignKey(l => l.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Loan -> User (approved by staff) - FIXED
            modelBuilder.Entity<Loan>()
                .HasOne(l => l.ApprovedByStaff)
                .WithMany(u => u.ApprovedLoans)
                .HasForeignKey(l => l.ApprovedByStaffId)
                .OnDelete(DeleteBehavior.SetNull);

            // Loan -> User (received by staff) - FIXED
            modelBuilder.Entity<Loan>()
                .HasOne(l => l.ReceivedByStaff)
                .WithMany(u => u.ReceivedLoans)
                .HasForeignKey(l => l.ReceivedByStaffId)
                .OnDelete(DeleteBehavior.SetNull);

            // Loan -> Asset
            modelBuilder.Entity<Loan>()
                .HasOne(l => l.Asset)
                .WithMany(a => a.Loans)
                .HasForeignKey(l => l.AssetId)
                .OnDelete(DeleteBehavior.Cascade);

            // LoanRequest -> User (requester)
            modelBuilder.Entity<LoanRequest>()
                .HasOne(lr => lr.User)
                .WithMany(u => u.LoanRequests)
                .HasForeignKey(lr => lr.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // LoanRequest -> Asset
            modelBuilder.Entity<LoanRequest>()
                .HasOne(lr => lr.Asset)
                .WithMany(a => a.LoanRequests)
                .HasForeignKey(lr => lr.AssetId)
                .OnDelete(DeleteBehavior.Cascade);

            // LoanRequest -> User (reviewed by)
            modelBuilder.Entity<LoanRequest>()
                .HasOne(lr => lr.ReviewedByStaff)
                .WithMany()
                .HasForeignKey(lr => lr.ReviewedByStaffId)
                .OnDelete(DeleteBehavior.SetNull);

            // Notification -> User
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // AssetHistory -> Asset
            modelBuilder.Entity<AssetHistory>()
                .HasOne(ah => ah.Asset)
                .WithMany(a => a.AssetHistories)
                .HasForeignKey(ah => ah.AssetId)
                .OnDelete(DeleteBehavior.Cascade);

            // AssetHistory -> User
            modelBuilder.Entity<AssetHistory>()
                .HasOne(ah => ah.ChangedByUser)
                .WithMany(u => u.AssetHistories)
                .HasForeignKey(ah => ah.ChangedBy)
                .OnDelete(DeleteBehavior.Cascade);
        }

    }
}