using Crowdfunding.API.Models;

namespace Crowdfunding.API.Repositories.Interfaces   // fixed: was Crowdfunding.API.Repositories
{
    public interface IInvestmentRepository
    {
        Task<int> InvestInCampaign(Investment investment);
        Task<IEnumerable<Investment>> GetInvestmentsByUser(int investorId);
        Task<Investment> GetInvestmentById(int investmentId);
        Task UpdateInvestmentStatus(int investmentId, string status);
    }
}
