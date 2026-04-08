using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;

namespace DeviceManagement.Api.Tests;

public class UsersApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public UsersApiTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetUsers_ReturnsSuccessStatusCode()
    {
        var response = await _client.GetAsync("/api/Users");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetDevices_ReturnsSuccessStatusCode()
    {
        var response = await _client.GetAsync("/api/Devices");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}



