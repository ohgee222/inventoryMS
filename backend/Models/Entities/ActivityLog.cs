namespace InventoryMS.Models.Entities
{
    public class ActivityLog
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public string? UserName { get; set; }
        public string ActivityType { get; set; }
        public string Description { get; set; }
        public string? RelatedEntityType { get; set; }
        public int? RelatedEntityId { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation
        public Users? User { get; set; }
    }
}