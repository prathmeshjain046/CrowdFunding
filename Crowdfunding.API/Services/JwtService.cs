using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Crowdfunding.API.Models;

namespace Crowdfunding.API.Services
{
    public class JwtService
    {
        private readonly IConfiguration _config;
        private readonly string _secretKey;
        private readonly string _issuer;
        private readonly string _audience;
        private readonly int _expiryMinutes;

        public JwtService(IConfiguration config)
        {
            _config = config ?? throw new ArgumentNullException(nameof(config));

            // Read JWT settings
            _secretKey = _config["JwtSettings:Key"] ?? throw new ArgumentNullException("JWT Secret Key is missing in configuration!");
            _issuer = _config["JwtSettings:Issuer"] ?? throw new ArgumentNullException("JWT Issuer is missing in configuration!");
            _audience = _config["JwtSettings:Audience"] ?? throw new ArgumentNullException("JWT Audience is missing in configuration!");
            _expiryMinutes = int.TryParse(_config["JwtSettings:ExpiryMinutes"], out var minutes) ? minutes : 60;

            // Log (Masked Secret Key)
            Console.WriteLine($"[JwtService] Secret Key Loaded: {MaskSecretKey(_secretKey)}");
            Console.WriteLine($"[JwtService] Issuer: {_issuer}, Audience: {_audience}, Expiry: {_expiryMinutes} minutes");
        }

        public string GenerateToken(User user)
        {
            if (user == null) throw new ArgumentNullException(nameof(user));

            var keyBytes = Encoding.UTF8.GetBytes(_secretKey);
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("FullName", user.FullName) // ✅ Added FullName to JWT claims
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(_expiryMinutes),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(keyBytes), SecurityAlgorithms.HmacSha256Signature),
                Issuer = _issuer,
                Audience = _audience
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public int? GetUserIdFromToken(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return null;

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_secretKey);

            try
            {
                var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _issuer,
                    ValidateAudience = true,
                    ValidAudience = _audience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out var validatedToken);

                var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier);
                return userIdClaim != null ? int.Parse(userIdClaim.Value) : null;
            }
            catch
            {
                return null;
            }
        }

        private string MaskSecretKey(string secret)
        {
            return secret.Length > 10 ? $"{secret[..5]}*****{secret[^5..]}" : "**********";
        }
    }
}
