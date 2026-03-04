using Domain.Interfaces.Repositories.Users;
using Infrastructure.Data;
using Infrastructure.Repositories.Users;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
           .UseSnakeCaseNamingConvention();
});
//builder.Services.AddScoped<IUserRepository, UserRepository>();

var app = builder.Build();

app.Run();