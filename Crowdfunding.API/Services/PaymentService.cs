using System.Threading.Tasks;

namespace Crowdfunding.API.Services
{
    public class PaymentService
    {
        public async Task<bool> ProcessPayment(decimal amount)
        {
            await Task.Delay(2000); 
            return true;
        }
    }
}

