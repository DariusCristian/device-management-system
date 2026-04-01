using DeviceManagement.Api.Data;
using DeviceManagement.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace DeviceManagement.Api.Controllers;


public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UsersController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetAll()
    {
        var users = await _context.Users.ToListAsync();
        return Ok(users);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<User>> GetById(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return NotFound();

        return Ok(user);
    }
    
    [HttpPost]
    public async Task<ActionResult<User>> Create(User user)
    {
        if (string.IsNullOrWhiteSpace(user.Name) ||
            string.IsNullOrWhiteSpace(user.Role) ||
            string.IsNullOrWhiteSpace(user.Location))
        {
            return BadRequest("All fields are required.");
        }

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
    }
    
    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update(int id, User updatedUser)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return NotFound();

        if (string.IsNullOrWhiteSpace(updatedUser.Name) ||
            string.IsNullOrWhiteSpace(updatedUser.Role) ||
            string.IsNullOrWhiteSpace(updatedUser.Location))
        {
            return BadRequest("All fields are required.");
        }

        user.Name = updatedUser.Name;
        user.Role = updatedUser.Role;
        user.Location = updatedUser.Location;

        await _context.SaveChangesAsync();

        return NoContent();
    }
    
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return NotFound();

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}