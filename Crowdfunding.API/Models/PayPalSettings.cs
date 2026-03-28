namespace Crowdfunding.API.Models
{
    namespace Crowdfunding.API.Models
    {
        public class PayPalSettings
        {
            public string BaseUrl { get; set; } // PayPal API URL (Sandbox or Live)
            public string ClientId { get; set; } // PayPal Client ID
            public string ClientSecret { get; set; } // PayPal Secret Key
        }
    }
}
