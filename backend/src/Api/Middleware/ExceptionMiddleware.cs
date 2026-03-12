using Serilog;

namespace Api.Middleware;

public class ExceptionMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Необработанное исключение при вызове {Path}: {Message}",
                context.Request.Path, ex.Message);

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;

            var response = new
            {
                Status = context.Response.StatusCode,
                Message = "Произошла внутренняя ошибка сервера. Обратитесь в поддержку.",
                Detail = ex.Message
            };

            await context.Response.WriteAsJsonAsync(response);
        }
    }
}