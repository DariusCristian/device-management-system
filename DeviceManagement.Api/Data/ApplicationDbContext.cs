using DevineManagement.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevineManagement.Api.Data;


public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {

    }
    
    public DbSet<Device> Devices=> Set<Device>();
    public DbSet<User> Users => Set<User>();
}