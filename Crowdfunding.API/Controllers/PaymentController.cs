using Microsoft.AspNetCore.Mvc;
using Stripe;


namespace Crowdfunding.API.Controllers
{
    [Route("api/stripe")]   // renamed — was "api/payments" which clashed with PaymentsController
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly PaymentIntentService _paymentIntentService;

        public PaymentController(IConfiguration configuration)
        {
            _configuration = configuration;
            StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];
            _paymentIntentService = new PaymentIntentService();
        }

        [HttpPost("create-payment-intent")]
        public async Task<IActionResult> CreatePaymentIntent([FromBody] PaymentRequest request)
        {
            if (request == null || request.Amount <= 0)
            {
                return BadRequest(new { error = "Invalid payment request. Amount must be greater than zero." });
            }

            try
            {
                var paymentIntent = await _paymentIntentService.CreateAsync(new PaymentIntentCreateOptions
                {
                    Amount = (long)(request.Amount * 100), // Convert to cents
                    Currency = "usd",
                    PaymentMethodTypes = new List<string> { "card" }
                });

                return Ok(new { clientSecret = paymentIntent.ClientSecret });
            }
            catch (StripeException stripeEx)
            {
                return BadRequest(new { error = $"Stripe error: {stripeEx.Message}" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = $"Server error: {ex.Message}" });
            }
        }
    }

    public class PaymentRequest
    {
        public decimal Amount { get; set; }
    }
}
