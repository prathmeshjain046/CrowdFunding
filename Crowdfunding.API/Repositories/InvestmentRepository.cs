using Dapper;
using Crowdfunding.API.Data;
using Crowdfunding.API.Models;

namespace Crowdfunding.API.Repositories
{
    public class InvestmentRepository : IInvestmentRepository
    {
        private readonly DapperContext _context;

        public InvestmentRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<int> InvestInCampaign(Investment investment)
        {
            var query = @"INSERT INTO Investments (InvestorId, CampaignId, Amount, EquityAllocated, Status) 
                          VALUES (@InvestorId, @CampaignId, @Amount, @EquityAllocated, 'Pending');
                          SELECT CAST(SCOPE_IDENTITY() as int);";

            using var connection = _context.CreateConnection();
            return await connection.ExecuteScalarAsync<int>(query, investment);
        }

        public async Task<IEnumerable<Investment>> GetInvestmentsByUser(int investorId)
        {
            var query = "SELECT * FROM Investments WHERE InvestorId = @InvestorId";
            using var connection = _context.CreateConnection();
            return await connection.QueryAsync<Investment>(query, new { InvestorId = investorId });
        }

        public async Task<Investment> GetInvestmentById(int investmentId)
        {
            var query = "SELECT * FROM Investments WHERE Id = @InvestmentId";
            using var connection = _context.CreateConnection();
            return await connection.QueryFirstOrDefaultAsync<Investment>(query, new { InvestmentId = investmentId });
        }

  
        public async Task UpdateInvestmentStatus(int investmentId, string status)
        {
            var query = "UPDATE Investments SET Status = @Status WHERE Id = @InvestmentId";
            using var connection = _context.CreateConnection();
            await connection.ExecuteAsync(query, new { InvestmentId = investmentId, Status = status });
        }
    }
}
