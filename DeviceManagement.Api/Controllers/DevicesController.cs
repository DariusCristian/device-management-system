using System.Text;
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
            .Include(d => d.AssignedUser)
            .ToListAsync();
        return Ok(devices);
    }

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<Device>>> Search([FromQuery] string query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return Ok(new List<Device>());
        }

        var normalizedQuery = NormalizeText(query);
        var queryTokens = Tokenize(normalizedQuery);

        if (queryTokens.Count == 0)
        {
            return Ok(new List<Device>());
        }

        var devices = await _context.Devices
            .Include(d => d.AssignedUser)
            .ToListAsync();

        var rankedDevices = devices
            .Select(device => new
            {
                Device = device,
                Score = CalculateScore(device, queryTokens)
            })
            .Where(x => x.Score > 0)
            .OrderByDescending(x => x.Score)
            .ThenBy(x => x.Device.Name)
            .ThenBy(x => x.Device.Id)
            .Select(x => x.Device)
            .ToList();

        return Ok(rankedDevices);
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

    private static int CalculateScore(Device device, List<string> queryTokens)
    {
        var score = 0;

        var normalizedName = NormalizeText(device.Name);
        var normalizedManufacturer = NormalizeText(device.Manufacturer);
        var normalizedProcessor = NormalizeText(device.Processor);
        var normalizedRam = NormalizeText($"{device.RamAmount}gb {device.RamAmount} gb {device.RamAmount}");

        var nameTokens = Tokenize(normalizedName);
        var manufacturerTokens = Tokenize(normalizedManufacturer);
        var processorTokens = Tokenize(normalizedProcessor);
        var ramTokens = Tokenize(normalizedRam);

        foreach (var token in queryTokens)
        {
            if (nameTokens.Contains(token))
                score += 10;
            else if (normalizedName.Contains(token))
                score += 6;

            if (manufacturerTokens.Contains(token))
                score += 7;
            else if (normalizedManufacturer.Contains(token))
                score += 4;

            if (processorTokens.Contains(token))
                score += 5;
            else if (normalizedProcessor.Contains(token))
                score += 3;

            if (ramTokens.Contains(token))
                score += 4;
            else if (normalizedRam.Contains(token))
                score += 2;
        }

        return score;
    }

    private static string NormalizeText(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        var builder = new StringBuilder();

        foreach (var ch in input.ToLowerInvariant())
        {
            if (char.IsLetterOrDigit(ch))
            {
                builder.Append(ch);
            }
            else
            {
                builder.Append(' ');
            }
        }

        return string.Join(' ', builder.ToString()
            .Split(' ', StringSplitOptions.RemoveEmptyEntries));
    }

    private static List<string> Tokenize(string input)
    {
        return input
            .Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Distinct()
            .ToList();
    }
}