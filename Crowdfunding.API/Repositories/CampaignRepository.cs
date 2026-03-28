using Dapper;
using Crowdfunding.API.Data;
using Crowdfunding.API.Models;
using Crowdfunding.API.Repositories.Interfaces;

namespace Crowdfunding.API.Repositories
{
    public class CampaignRepository : ICampaignRepository
    {
        private readonly DapperContext _context;

        public CampaignRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<int> CreateCampaign(Campaign campaign)
        {
            var query = @"INSERT INTO Campaigns (FounderId, Title, Description, FundingGoal, EquityOffered, Status, AmountRaised) 
                          VALUES (@FounderId, @Title, @Description, @FundingGoal, @EquityOffered, 'Active', 0);
                          SELECT CAST(SCOPE_IDENTITY() as int);";

            using var connection = _context.CreateConnection();
            return await connection.ExecuteScalarAsync<int>(query, campaign);
        }

        public async Task<IEnumerable<Campaign>> GetAllCampaigns()
        {
            var query = "SELECT * FROM Campaigns";
            using var connection = _context.CreateConnection();
            return await connection.QueryAsync<Campaign>(query);
        }

        public async Task<Campaign?> GetCampaignById(int id)
        {
            var query = "SELECT * FROM Campaigns WHERE Id = @Id";
            using var connection = _context.CreateConnection();
            return await connection.QuerySingleOrDefaultAsync<Campaign>(query, new { Id = id });
        }

        public async Task<IEnumerable<Campaign>> GetCampaignsByFounderId(int founderId)
        {
            var query = "SELECT * FROM Campaigns WHERE FounderId = @FounderId";
            using var connection = _context.CreateConnection();
            return await connection.QueryAsync<Campaign>(query, new { FounderId = founderId });
        }

        public async Task<bool> UpdateFundsRaised(int campaignId, decimal amountInvested)
        {
            var checkQuery = "SELECT COUNT(*) FROM Campaigns WHERE Id = @CampaignId";
            var updateQuery = "UPDATE Campaigns SET AmountRaised = AmountRaised + @AmountInvested WHERE Id = @CampaignId";

            using var connection = _context.CreateConnection();

            int campaignExists = await connection.ExecuteScalarAsync<int>(checkQuery, new { CampaignId = campaignId });
            if (campaignExists == 0)
            {
                return false;
            }

            await connection.ExecuteAsync(updateQuery, new { AmountInvested = amountInvested, CampaignId = campaignId });
            return true;
        }

        public async Task<bool> UpdateCampaignStatus(int campaignId, int founderId, string newStatus)
        {
            var checkCampaignQuery = "SELECT FounderId FROM Campaigns WHERE Id = @CampaignId";
            var updateQuery = "UPDATE Campaigns SET Status = @NewStatus WHERE Id = @CampaignId";

            using var connection = _context.CreateConnection();

            var ownerId = await connection.ExecuteScalarAsync<int?>(checkCampaignQuery, new { CampaignId = campaignId });

            if (ownerId == null || ownerId != founderId)
            {
                return false;
            }

            await connection.ExecuteAsync(updateQuery, new { NewStatus = newStatus, CampaignId = campaignId });
            return true;
        }
    }
}

