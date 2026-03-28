using Crowdfunding.API.Models;

namespace Crowdfunding.API.Managers.Interfaces
{
    public interface ICampaignManager
    {
        Task<int> CreateCampaign(Campaign campaign);
        Task<IEnumerable<Campaign>> GetAllCampaigns();
        Task<Campaign?> GetCampaignById(int id);
        Task<IEnumerable<Campaign>> GetCampaignsByFounderId(int founderId);
        Task<bool> UpdateCampaignStatus(int campaignId, int founderId, string newStatus);
    }
}