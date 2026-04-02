using DeviceManagement.Api.Data;
using DeviceManagement.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DeviceManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DevicesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DevicesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Device>>> GetAll()
    {
        var devices = await _context.Devices
            .Include(d=>d.AssignedUser)
            .ToListAsync();
        return Ok(devices);
    }
    
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Device>> GetById(int id)
    {
        var device = await _context.Devices
            .Include(d => d.AssignedUser)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (device == null)
            return NotFound();

        return Ok(device);
    }
    
    [HttpPost]
    public async Task<ActionResult<Device>> Create(Device device)
    {
        if (string.IsNullOrWhiteSpace(device.Name) ||
            string.IsNullOrWhiteSpace(device.Manufacturer) ||
            string.IsNullOrWhiteSpace(device.Type) ||
            string.IsNullOrWhiteSpace(device.OperatingSystem) ||
            string.IsNullOrWhiteSpace(device.OsVersion) ||
            string.IsNullOrWhiteSpace(device.Processor) ||
            string.IsNullOrWhiteSpace(device.Description) ||
            device.RamAmount <= 0)
        {
            return BadRequest("All fields are required and RAM must be greater than 0.");
        }

        _context.Devices.Add(device);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = device.Id }, device);
    }
    
    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update(int id, Device updatedDevice)
    {
        var device = await _context.Devices
            .Include(d => d.AssignedUser)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (device == null)
            return NotFound();

        if (string.IsNullOrWhiteSpace(updatedDevice.Name) ||
            string.IsNullOrWhiteSpace(updatedDevice.Manufacturer) ||
            string.IsNullOrWhiteSpace(updatedDevice.Type) ||
            string.IsNullOrWhiteSpace(updatedDevice.OperatingSystem) ||
            string.IsNullOrWhiteSpace(updatedDevice.OsVersion) ||
            string.IsNullOrWhiteSpace(updatedDevice.Processor) ||
            string.IsNullOrWhiteSpace(updatedDevice.Description) ||
            updatedDevice.RamAmount <= 0)
        {
            return BadRequest("All fields are required and RAM must be greater than 0.");
        }

        device.Name = updatedDevice.Name;
        device.Manufacturer = updatedDevice.Manufacturer;
        device.Type = updatedDevice.Type;
        device.OperatingSystem = updatedDevice.OperatingSystem;
        device.OsVersion = updatedDevice.OsVersion;
        device.Processor = updatedDevice.Processor;
        device.RamAmount = updatedDevice.RamAmount;
        device.Description = updatedDevice.Description;
        device.AssignedUserId = updatedDevice.AssignedUserId;
        
        await _context.SaveChangesAsync();

        return NoContent();
    }
    
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id)
    {
        var device = await _context.Devices.FindAsync(id);

        if (device == null)
            return NotFound();

        _context.Devices.Remove(device);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}