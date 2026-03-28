using Crowdfunding.API.Models;

namespace Crowdfunding.API.Managers.Interfaces
{
    public interface IInvestmentManager
    {
        Task<int> InvestInCampaign(Investment investment, int investorId);
        Task<bool> ConfirmPayment(int investmentId, int investorId);
        Task<IEnumerable<Investment>> GetInvestmentsByUser(int userId);
    }
}
