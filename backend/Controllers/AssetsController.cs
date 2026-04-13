using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InventoryMS.Data;
using InventoryMS.Models.Entities;
using InventoryMS.Models.Enums;
using System.Diagnostics;
using Microsoft.AspNetCore.Authorization;


using InventoryMS.Services;

namespace InventoryMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Require authentication for all endpoints in this controller
    public class AssetsController : ControllerBase
    {
        private readonly InventoryDb _context;
        private readonly ActivityLogger _activityLogger;

      public AssetsController(InventoryDb context, ActivityLogger activityLogger)
    {
        _context = context;
        _activityLogger = activityLogger;
    }

        // GET: api/Assets
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Asset>>> GetAssets()
        {
            var assets = await _context.Assets
                .Include(a => a.Category)
                .ToListAsync();

            return Ok(assets);
        }

        // GET: api/Assets/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Asset>> GetAsset(int id)
        {
            var asset = await _context.Assets
                .Include(a => a.Category)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (asset == null)
            {
                return NotFound(new { message = $"Asset with ID {id} not found" });
            }

            return Ok(asset);
        }

        // POST: api/Assets
        [Authorize(Roles = "Admin,Staff")] // Only allow Admin and Staff to create assets
        [HttpPost]
        public async Task<ActionResult<Asset>> CreateAsset([FromBody] CreateAssetDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            
                    // CHECK FOR DUPLICATE SERIAL NUMBER
            var existingSerial = await _context.Assets
                .FirstOrDefaultAsync(a => a.SerialNumber == dto.SerialNumber);
            
            if (existingSerial != null)
            {
                return BadRequest(new { message = $"Serial number '{dto.SerialNumber}' already exists" });
            }

            // Check category exists
            var categoryExists = await _context.Categories
                .AnyAsync(c => c.Id == dto.CategoryId);

            if (!categoryExists)
                return BadRequest(new { message = "Category does not exist" });
   

            var asset = new Asset
            {
                Name = dto.Name,
                CategoryId = dto.CategoryId,
                Description = dto.Description,
                SerialNumber = dto.SerialNumber,
                ItemCondition = dto.ItemCondition,
                PurchaseDate = dto.PurchaseDate,
                PurchasePrice = dto.PurchasePrice,
                Notes = dto.Notes,

                // backend-controlled defaults
                Status = AssetStatus.Available,
                PhysicalCondition = PhysicalCondition.Good,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Assets.Add(asset);
            await _context.SaveChangesAsync();

            //logging
            await _activityLogger.LogAsync(
            activityType: "AssetCreated",
            description: $"New asset added: {asset.Name}",
            relatedEntityType: "Asset",
            relatedEntityId: asset.Id
        );

            return CreatedAtAction(nameof(GetAsset), new { id = asset.Id }, asset);
        }

        // PUT: api/Assets/5
        [Authorize(Roles = "Admin,Staff")] // Only allow Admin and Staff to update assets
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAsset(int id, UpdateAssetDto dto)
        {
            var asset = await _context.Assets.FindAsync(id);

            var oldName = asset.Name;
            var oldCategoryId = asset.CategoryId;
            var oldDescription = asset.Description;
            var oldSerialNumber = asset.SerialNumber;
            var oldStatus = asset.Status;
            var oldCondition = asset.PhysicalCondition;

            if (asset == null)
            {
                return NotFound(new { message = $"Asset with ID {id} not found" });
            }
             // IF UPDATING SERIAL NUMBER, CHECK FOR DUPLICATES
                if (!string.IsNullOrEmpty(dto.SerialNumber) && dto.SerialNumber != asset.SerialNumber)
                {
                    var existingSerial = await _context.Assets
                        .FirstOrDefaultAsync(a => a.SerialNumber == dto.SerialNumber);
                    
                    if (existingSerial != null)
                    {
                        return BadRequest(new { message = $"Serial number '{dto.SerialNumber}' already exists" });
                    }
                }

            // Update fields
            if (!string.IsNullOrEmpty(dto.Name))
                asset.Name = dto.Name;

            if (dto.CategoryId.HasValue)
                asset.CategoryId = dto.CategoryId.Value;

            if (!string.IsNullOrEmpty(dto.Description))
                asset.Description = dto.Description;

            if (!string.IsNullOrEmpty(dto.SerialNumber))
                asset.SerialNumber = dto.SerialNumber;

            if (dto.Status.HasValue)
                asset.Status = dto.Status.Value;

            if (dto.PhysicalCondition.HasValue)
                asset.PhysicalCondition = dto.PhysicalCondition.Value;

            asset.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                return StatusCode(500, new { message = "Error updating asset" });
            }
            var changes = new List<string>();

            if (oldName != asset.Name)
                changes.Add($"Name changed from '{oldName}' to '{asset.Name}'");

            if (oldCategoryId != asset.CategoryId)
                changes.Add($"Category changed");

            if (oldDescription != asset.Description)
                changes.Add("Description updated");

            if (oldSerialNumber != asset.SerialNumber)
                changes.Add($"Serial number changed from '{oldSerialNumber}' to '{asset.SerialNumber}'");

            if (oldStatus != asset.Status)
                changes.Add($"Status changed from {oldStatus} to {asset.Status}");

            if (oldCondition != asset.PhysicalCondition)
                changes.Add($"Condition changed from {oldCondition} to {asset.PhysicalCondition}");

            var description = changes.Count > 0
            ? $"Asset updated: {asset.Name} ({string.Join(", ", changes)})"
            : $"Asset updated: {asset.Name}";

            await _activityLogger.LogAsync(
                activityType: "AssetUpdated",
                description: description,
                relatedEntityType: "Asset",
                relatedEntityId: asset.Id
            );


            return Ok(asset);
        }

        
// GET: api/Assets/search
[Authorize(Roles = "Admin,Staff,Student")] 
[HttpGet("search")]
public async Task<ActionResult<IEnumerable<Asset>>> SearchAssets(string? name)
{
    var query = _context.Assets
        .Include(a => a.Category)
        .Where(a => a.Status == AssetStatus.Available) // only available assets
        .AsQueryable();

    if (!string.IsNullOrWhiteSpace(name))
    {
        query = query.Where(a =>
    a.Name.ToLower().Contains(name.ToLower()) ||
    a.SerialNumber.ToLower().Contains(name.ToLower()));
    }

    var results = await query.ToListAsync();

    return Ok(results);
}

        // DELETE: api/Assets/5
        [Authorize(Roles = "Admin")] // Only allow Admin to delete assets
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsset(int id)
        {
            var asset = await _context.Assets.FindAsync(id);

            if (asset == null)
            {
                return NotFound(new { message = $"Asset with ID {id} not found" });
            }

            _context.Assets.Remove(asset);
            await _context.SaveChangesAsync();

            //LOGGING
            await _activityLogger.LogAsync(
            activityType: "AssetDeleted",
            description: $"Asset deleted: {asset.Name}",
            relatedEntityType: "Asset",
            relatedEntityId: asset.Id
        );

            return Ok(new { message = $"Asset {asset.Name} deleted successfully" });
        }
    }

    // DTOs (Data Transfer Objects) - these define what data the API accepts
    public class CreateAssetDto
    {
        public string Name { get; set; }
        public int CategoryId { get; set; }
        public string Description { get; set; }
        public string SerialNumber { get; set; }
        public string ItemCondition { get; set; }
        public DateTime? PurchaseDate { get; set; }
        public decimal? PurchasePrice { get; set; }
        public string Notes { get; set; }
    }

    public class UpdateAssetDto
    {
        public string Name { get; set; }
        public int? CategoryId { get; set; }
        public string Description { get; set; }
        public string SerialNumber { get; set; }
        public AssetStatus? Status { get; set; }
        public PhysicalCondition? PhysicalCondition { get; set; }
    }
}
