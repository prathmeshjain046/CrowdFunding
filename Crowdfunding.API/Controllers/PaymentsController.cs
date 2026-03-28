using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace Crowdfunding.API.Controllers
{
    [Route("api/payments")]
    [ApiController]
    public class PaymentsController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;

        public PaymentsController(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _config = config;
        }

        [HttpPost("verify-payment")]
        [Authorize]
        public async Task<IActionResult> VerifyPayPalPayment([FromBody] PaymentVerificationRequest request)
        {
            if (string.IsNullOrWhiteSpace(request?.OrderId))
                return BadRequest(new { error = "OrderId is required." });

            var clientId     = _config["PayPal:ClientId"];
            var clientSecret = _config["PayPal:ClientSecret"];
            var baseUrl      = _config["PayPal:BaseUrl"] ?? "https://api-m.sandbox.paypal.com";

            var authHeader = Convert.ToBase64String(
                Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}"));

            using var verifyRequest = new HttpRequestMessage(
                HttpMethod.Get,
                $"{baseUrl}/v2/checkout/orders/{request.OrderId}");

            verifyRequest.Headers.Authorization =
                new AuthenticationHeaderValue("Basic", authHeader);

            var response = await _httpClient.SendAsync(verifyRequest);

            if (!response.IsSuccessStatusCode)
                return BadRequest(new { error = "PayPal order verification failed." });

            var responseData = await response.Content.ReadAsStringAsync();
            return Ok(responseData);
        }
    }

    public class PaymentVerificationRequest
    {
        public string OrderId { get; set; } = string.Empty;
    }
}
