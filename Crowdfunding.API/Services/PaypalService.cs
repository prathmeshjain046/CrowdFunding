using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Crowdfunding.API.Models;
using Microsoft.Extensions.Options;

namespace Crowdfunding.API.Services
{
    public class PayPalService
    {
        private readonly HttpClient _httpClient;
        private readonly PayPalSettings _settings;

        // HttpClient is injected by IHttpClientFactory — no socket exhaustion
        public PayPalService(HttpClient httpClient, IOptions<PayPalSettings> settings)
        {
            _httpClient = httpClient;
            _settings = settings.Value;
        }

        private async Task<string> GetAccessTokenAsync()
        {
            var authToken = Convert.ToBase64String(
                Encoding.UTF8.GetBytes($"{_settings.ClientId}:{_settings.ClientSecret}"));

            using var request = new HttpRequestMessage(
                HttpMethod.Post, $"{_settings.BaseUrl}/v1/oauth2/token");

            request.Headers.Authorization =
                new AuthenticationHeaderValue("Basic", authToken);
            request.Content = new StringContent(
                "grant_type=client_credentials",
                Encoding.UTF8,
                "application/x-www-form-urlencoded");

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var body = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(body);
            return doc.RootElement.GetProperty("access_token").GetString()
                ?? throw new Exception("PayPal access token was null.");
        }

        public async Task<string> CreatePaymentAsync(
            decimal amount, string currency, string returnUrl, string cancelUrl)
        {
            var accessToken = await GetAccessTokenAsync();

            using var request = new HttpRequestMessage(
                HttpMethod.Post, $"{_settings.BaseUrl}/v2/checkout/orders");

            request.Headers.Authorization =
                new AuthenticationHeaderValue("Bearer", accessToken);

            var payload = new
            {
                intent = "CAPTURE",
                purchase_units = new[]
                {
                    new { amount = new { currency_code = currency, value = amount.ToString("F2") } }
                },
                application_context = new { return_url = returnUrl, cancel_url = cancelUrl }
            };

            request.Content = new StringContent(
                JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var body = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(body);
            return doc.RootElement.GetProperty("id").GetString()
                ?? throw new Exception("PayPal order ID was null.");
        }

        public async Task<bool> CapturePaymentAsync(string orderId)
        {
            var accessToken = await GetAccessTokenAsync();

            using var request = new HttpRequestMessage(
                HttpMethod.Post, $"{_settings.BaseUrl}/v2/checkout/orders/{orderId}/capture");

            request.Headers.Authorization =
                new AuthenticationHeaderValue("Bearer", accessToken);
            request.Content = new StringContent("", Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(request);
            return response.IsSuccessStatusCode;
        }
    }
}
