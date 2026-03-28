using Stripe;

namespace Crowdfunding.API.Manager
{
    public class PaymentManager : IPaymentManager
    {
        private readonly PaymentIntentService _paymentIntentService;
        private readonly string _stripeSecretKey;

        public PaymentManager(IConfiguration configuration)
        {
            _stripeSecretKey = configuration["Stripe:SecretKey"];
            StripeConfiguration.ApiKey = _stripeSecretKey;
            _paymentIntentService = new PaymentIntentService();
        }

        public async Task<string> CreatePaymentIntent(decimal amount)
        {
            if (amount <= 0)
            {
                throw new ArgumentException("Amount must be greater than zero.");
            }

            var paymentIntent = await _paymentIntentService.CreateAsync(new PaymentIntentCreateOptions
            {
                Amount = (long)(amount * 100), // Convert to cents
                Currency = "usd",
                PaymentMethodTypes = new List<string> { "card" }
            });

            return paymentIntent.ClientSecret;
        }
    }

}
