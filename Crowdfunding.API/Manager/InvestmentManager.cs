using Crowdfunding.API.Managers.Interfaces;
using Crowdfunding.API.Models;
using Crowdfunding.API.Repositories.Interfaces;

namespace Crowdfunding.API.Managers
{
    public class InvestmentManager : IInvestmentManager
    {
        private readonly IInvestmentRepository _investmentRepository;
        private readonly ICampaignRepository _campaignRepository;

        public InvestmentManager(
            IInvestmentRepository investmentRepository,
            ICampaignRepository campaignRepository)
        {
            _investmentRepository = investmentRepository;
            _campaignRepository = campaignRepository;
        }

        public async Task<int> InvestInCampaign(Investment investment, int investorId)
        {
            var campaign = await _campaignRepository.GetCampaignById(investment.CampaignId);

            if (campaign == null || campaign.Status != "Active")
                throw new InvalidOperationException("Campaign not found or is not active.");

            decimal remaining = campaign.FundingGoal - campaign.AmountRaised;
            if (investment.Amount > remaining)
                throw new InvalidOperationException(
                    $"Investment exceeds remaining funding goal. Max allowed: ${remaining}");

            investment.InvestorId = investorId;
            investment.EquityAllocated =
                (investment.Amount / campaign.FundingGoal) * campaign.EquityOffered;
            investment.Status = "Pending";

            return await _investmentRepository.InvestInCampaign(investment);
        }

        public async Task<bool> ConfirmPayment(int investmentId, int investorId)
        {
            var investment = await _investmentRepository.GetInvestmentById(investmentId);

            if (investment == null || investment.InvestorId != investorId)
                return false;

            if (investment.Status != "Pending")
                return false;

            await _investmentRepository.UpdateInvestmentStatus(investmentId, "Success");
            await _campaignRepository.UpdateFundsRaised(investment.CampaignId, investment.Amount);
            return true;
        }

        public async Task<IEnumerable<Investment>> GetInvestmentsByUser(int userId)
            => await _investmentRepository.GetInvestmentsByUser(userId);
    }
}
