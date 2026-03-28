using Crowdfunding.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Crowdfunding.API.Repositories.Interfaces
{
    public interface ICampaignRepository
    {
        Task<int> CreateCampaign(Campaign campaign);
        Task<IEnumerable<Campaign>> GetAllCampaigns();
        Task<Campaign?> GetCampaignById(int id);
        Task<IEnumerable<Campaign>> GetCampaignsByFounderId(int founderId);
        Task<bool> UpdateFundsRaised(int campaignId, decimal amountInvested);
        Task<bool> UpdateCampaignStatus(int campaignId, int founderId, string newStatus);
    }
}
