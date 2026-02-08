using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InventoryMS.Data;
using InventoryMS.Models.Entities;

namespace InventoryMS.Controllers
{
    [Route("api/[controller]")] // created the api controller
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        // creating controller for the categories to test the api
        private readonly InventoryDb _context;

        public CategoriesController(InventoryDb context)
        {
            _context = context;
        }

        // GET: api/Categories
        // retuens al;l categories as JSON
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {

            // query databse for all categories and retuen with 200 ok status
            return Ok(await _context.Categories.ToListAsync());
        }

        // GET: api/Categories/5
        // to return siingh,e category by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> GetCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);

            if (category == null)
            {
                return NotFound();
            }

            return Ok(category);
        }

        // POST: api/Categories
        [HttpPost]
        public async Task<ActionResult<Category>> CreateCategory(CreateCategoryDto dto)
        {
            // create category with dto data
            var category = new Category
            {
                Name = dto.Name,
                Description = dto.Description,
                MaxLoanDays = dto.MaxLoanDays ?? 14,
                RequiresApproval = dto.RequiresApproval ?? true
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
        }

        // PUT: api/Categories/5
        //update existing category
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, UpdateCategoryDto dto)
        {
            var category = await _context.Categories.FindAsync(id);

            if (category == null)
            {
                return NotFound();
            }
            // Only update fields that were provided (not null/empty)
            if (!string.IsNullOrEmpty(dto.Name))
                category.Name = dto.Name;

            if (dto.Description != null)
                category.Description = dto.Description;

            if (dto.MaxLoanDays.HasValue)
                category.MaxLoanDays = dto.MaxLoanDays.Value;

            if (dto.RequiresApproval.HasValue)
                category.RequiresApproval = dto.RequiresApproval.Value;

            await _context.SaveChangesAsync();

            return Ok(category);
        }

        // DELETE: api/Categories/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);

            if (category == null)
            {
                return NotFound();
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Category '{category.Name}' deleted" });
        }
    }

    // DTOs
    // for request9ing certain inronations from the user
    public class CreateCategoryDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public int? MaxLoanDays { get; set; }
        public bool? RequiresApproval { get; set; }
    }

    public class UpdateCategoryDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public int? MaxLoanDays { get; set; }
        public bool? RequiresApproval { get; set; }
    }
}