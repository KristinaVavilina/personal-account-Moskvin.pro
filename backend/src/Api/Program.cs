using Api.Middleware;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information() // Минимальный уровень логов
    .Enrich.FromLogContext()     // Добавляет контекст (например, UserId из запроса)
    .Enrich.WithMachineName()   // Добавляет имя сервера в логи
    .WriteTo.Console()          // Дублируем в консоль для удобства
    .WriteTo.Seq("http://localhost:5341") // ОТПРАВКА В SEQ
    .CreateLogger();

builder.Host.UseSerilog();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
           .UseSnakeCaseNamingConvention();
});

try
{
    Log.Information("Приложение запускается...");
    var app = builder.Build();

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