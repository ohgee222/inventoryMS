using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InventoryMS.Data;
using InventoryMS.Models.Entities;
using InventoryMS.Models.Enums;
using System.Diagnostics;

namespace InventoryMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AssetsController : ControllerBase
    {
        private readonly InventoryDb _context;

        public AssetsController(InventoryDb context)
        {
            _context = context;
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
        [HttpPost]
        public async Task<ActionResult<Asset>> CreateAsset(CreateAssetDto dto)
        {
            // Check if category exists
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId);
            if (!categoryExists)
            {
                return BadRequest(new { message = "Category does not exist" });
            }

            var asset = new Asset
            {
                Name = dto.Name,
                CategoryId = dto.CategoryId,
                Description = dto.Description,
                SerialNumber = dto.SerialNumber,
                Status = AssetStatus.Available,
                PhysicalCondition = PhysicalCondition.Good,
                ItemCondition = dto.ItemCondition,
                PurchaseDate = dto.PurchaseDate,
                PurchasePrice = dto.PurchasePrice,
                Notes = dto.Notes,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Assets.Add(asset);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAsset), new { id = asset.Id }, asset);
        }

        // PUT: api/Assets/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAsset(int id, UpdateAssetDto dto)
        {
            var asset = await _context.Assets.FindAsync(id);

            if (asset == null)
            {
                return NotFound(new { message = $"Asset with ID {id} not found" });
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

            return Ok(asset);
        }

        // DELETE: api/Assets/5
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
