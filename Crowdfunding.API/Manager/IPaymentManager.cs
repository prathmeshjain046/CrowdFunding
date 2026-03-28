public interface IPaymentManager
{
    Task<string> CreatePaymentIntent(decimal amount);
}
