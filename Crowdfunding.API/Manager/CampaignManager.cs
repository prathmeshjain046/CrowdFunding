using Crowdfunding.API.Managers.Interfaces;
using Crowdfunding.API.Repositories.Interfaces;
using Crowdfunding.API.Models;

namespace Crowdfunding.API.Managers
{
    public class CampaignManager : ICampaignManager
    {
        private readonly ICampaignRepository _campaignRepository;

        public CampaignManager(ICampaignRepository campaignRepository)
        {
            _campaignRepository = campaignRepository;
        }

        public async Task<int> CreateCampaign(Campaign campaign)
        {
            return await _campaignRepository.CreateCampaign(campaign);
        }

        public async Task<IEnumerable<Campaign>> GetAllCampaigns()
        {
            return await _campaignRepository.GetAllCampaigns();
        }

        public async Task<Campaign?> GetCampaignById(int id)
        {
            return await _campaignRepository.GetCampaignById(id);
        }

        public async Task<IEnumerable<Campaign>> GetCampaignsByFounderId(int founderId)
        {
            return await _campaignRepository.GetCampaignsByFounderId(founderId);
        }

        public async Task<bool> UpdateCampaignStatus(int campaignId, int founderId, string newStatus)
        {
            return await _campaignRepository.UpdateCampaignStatus(campaignId, founderId, newStatus);
        }
    }
}