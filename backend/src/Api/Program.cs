using Api.Middleware;
using Application.Interfaces.Services.KnowledgeBase;
using Application.Interfaces.Services.System;
using Application.Interfaces.Services.TimeLogs;
using Application.Interfaces.Services.Users;
using Application.Services.KnowledgeBase;
using Application.Services.System;
using Application.Services.TimeLogs;
using Application.Services.Users;
using Application.Mapping;
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

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .WriteTo.Console()
    .WriteTo.Seq("http://localhost:5341")
    .CreateLogger();

builder.Host.UseSerilog();

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