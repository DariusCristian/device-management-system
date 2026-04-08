using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using DeviceManagement.Api.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace DeviceManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AiController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public AiController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    [HttpPost("generate-description")]
    public async Task<ActionResult<GenerateDescriptionResponse>> GenerateDescription(GenerateDescriptionRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) ||
            string.IsNullOrWhiteSpace(request.Manufacturer) ||
            string.IsNullOrWhiteSpace(request.Type) ||
            string.IsNullOrWhiteSpace(request.OperatingSystem) ||
            string.IsNullOrWhiteSpace(request.OsVersion) ||
            string.IsNullOrWhiteSpace(request.Processor) ||
            request.RamAmount <= 0)
        {
            return BadRequest("All fields are required and RAM must be greater than 0.");
        }

        var apiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY");
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return StatusCode(500, "Gemini API key is not configured.");
        }

        var prompt = $"""
                      Generate one professional device description for a business inventory app.

                      Rules:
                      - One sentence only.
                      - Maximum 18 words.
                      - Human-readable and concise.
                      - Mention manufacturer and device category.
                      - Mention operating system naturally.
                      - Mention business usefulness.
                      - Do not list specs mechanically.
                      - Do not repeat the exact device name unless necessary.

                      Example style:
                      "A high-performance Apple smartphone running iOS, suitable for daily business use."

                      Device:
                      - Name: {request.Name}
                      - Manufacturer: {request.Manufacturer}
                      - Type: {request.Type}
                      - Operating System: {request.OperatingSystem}
                      - OS Version: {request.OsVersion}
                      - Processor: {request.Processor}
                      - RAM: {request.RamAmount} GB
                      """;
        var payload = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            }
        };

        var json = JsonSerializer.Serialize(payload);
        var client = _httpClientFactory.CreateClient();

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}";
        using var content = new StringContent(json, Encoding.UTF8, "application/json");
        using var response = await client.PostAsync(url, content);

        if (!response.IsSuccessStatusCode)
        {
            var errorText = await response.Content.ReadAsStringAsync();
            return StatusCode((int)response.StatusCode, errorText);
        }

        var responseText = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(responseText);

        var description =
            document.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString() ?? string.Empty;

        return Ok(new GenerateDescriptionResponse
        {
            Description = description.Trim()
        });
    }
}