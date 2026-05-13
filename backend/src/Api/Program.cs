using System.Text;
using Api.Middleware;
using Application.Interfaces.Services;
using Application.Interfaces.Services.KnowledgeBase;
using Application.Interfaces.Services.System;
using Application.Interfaces.Services.TimeLogs;
using Application.Interfaces.Services.Users;
using Application.Options;
using Application.Services;
using Application.Services.KnowledgeBase;
using Application.Services.System;
using Application.Services.TimeLogs;
using Application.Services.Users;
using Application.Mapping;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Domain.Interfaces.Repositories.KnowledgeBase;
using Domain.Interfaces.Repositories.System;
using Domain.Interfaces.Repositories.TimeLogs;
using Domain.Interfaces.Repositories.Users;
using Infrastructure.Data;
using Infrastructure.Repositories.KnowledgeBase;
using Infrastructure.Repositories.System;
using Infrastructure.Repositories.TimeLogs;
using Infrastructure.Repositories.Users;
using Microsoft.EntityFrameworkCore;
using Serilog;
using Application.Interfaces.Services.Render;
using Application.Services.Render;

var builder = WebApplication.CreateBuilder(args);

var seqUrl = Environment.GetEnvironmentVariable("Seq__ServerUrl")
             ?? builder.Configuration["Seq:ServerUrl"]
             ?? "http://seq:80";

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .WriteTo.Console()
    .WriteTo.Seq("http://seq:80")
    .CreateLogger();

builder.Host.UseSerilog();

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));

var jwtSection = builder.Configuration.GetSection(JwtOptions.SectionName);
var jwtOptions = jwtSection.Get<JwtOptions>()
    ?? throw new InvalidOperationException($"Секция {JwtOptions.SectionName} не настроена.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SigningKey)),
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1),
        };
    });

builder.Services.AddHttpClient<RenderServiceClient>(client =>
{
    var apiUrl = builder.Configuration["RenderService:ApiUrl"];
    if (!string.IsNullOrEmpty(apiUrl))
    {
        client.BaseAddress = new Uri(apiUrl);
    }
});

builder.Services.AddAuthorization();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options => {
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
           .UseSnakeCaseNamingConvention();
});

// Repository

builder.Services.AddScoped<IKbRepository, KbRepository>();
builder.Services.AddScoped<IQuickLinkRepository, QuickLinkRepository>();
builder.Services.AddScoped<ISystemRepository, SystemRepository>();
builder.Services.AddScoped<IDailyReflectionRepository, DailyReflectionRepository>();
builder.Services.AddScoped<ITaskRepository, TaskRepository>();
builder.Services.AddScoped<ITaskTypeRepository, TaskTypeRepository>();
builder.Services.AddScoped<ITimeLogRepository, TimeLogRepository>();
builder.Services.AddScoped<IPositionRepository, PositionRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

// Services

builder.Services.AddScoped<IKbService, KbService>();
builder.Services.AddScoped<IQuickLinkService, QuickLinkService>();
builder.Services.AddScoped<ISystemService, SystemService>();
builder.Services.AddScoped<IDailyReflectionService, DailyReflectionService>();
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<ITaskTypeService, TaskTypeService>();
builder.Services.AddScoped<ITimeLogService, TimeLogService>();
builder.Services.AddScoped<IPositionService, PositionService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IRenderService, RenderService>();

// Для поиска профилей в текущей сборке
builder.Services.AddAutoMapper(_ => { }, typeof(ApplicationMappingProfile).Assembly);

try
{
    Log.Information("Приложение запускается...");
    var app = builder.Build();

    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        try
        {
            var context = services.GetRequiredService<Infrastructure.Data.AppDbContext>();
            context.Database.Migrate();
            Log.Information("Миграции успешно применены.");
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Ошибка при накатывании миграций");
        }
    }

    app.UseMiddleware<ExceptionMiddleware>();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseHttpsRedirection();
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Приложение не смогло запуститься");
}
finally
{
    Log.CloseAndFlush();
}