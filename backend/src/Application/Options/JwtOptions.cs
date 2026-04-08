namespace Application.Options;

public class JwtOptions
{
    public const string SectionName = "Jwt";

    public required string Issuer { get; set; }

    public required string Audience { get; set; }

    /// <summary>Секрет для подписи HMAC-SHA256 (не короче 32 символов).</summary>
    public required string SigningKey { get; set; }

    public int ExpirationMinutes { get; set; } = 60;
}
