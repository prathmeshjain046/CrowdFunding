using Dapper;
using Crowdfunding.API.Data;
using Crowdfunding.API.Models;
using System.Data;

namespace Crowdfunding.API.Repositories
{
    public class ReportRepository : IReportRepository
    {
        private readonly DapperContext _context;

        public ReportRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Investment>> GetPaymentReport(int investorId)
        {
            var query = "SELECT * FROM Investments WHERE InvestorId = @InvestorId ORDER BY CreatedAt DESC";
            using var connection = _context.CreateConnection();
            var result = await connection.QueryAsync<Investment>(query);
            return result ?? new List<Investment>();  
        }

        public async Task<IEnumerable<dynamic>> GetSharesAllocatedReport(int campaignId)
        {
            var query = @"
                SELECT i.InvestorId, i.Amount, i.EquityAllocated, i.Status, u.Fullname 
                FROM Investments i
                JOIN Users u ON i.InvestorId = u.Id
                WHERE i.CampaignId = @CampaignId AND i.Status = 'Success'
                ORDER BY i.CreatedAt DESC";

            using var connection = _context.CreateConnection();
            return await connection.QueryAsync(query, new { CampaignId = campaignId });
        }

        public async Task<dynamic> GetDashboardSummary(int userId, string role)
        {
            using var connection = _context.CreateConnection();

            if (role == "Founder")
            {
                var query = @"
            SELECT 
                c.Id AS CampaignId,
                c.Title,
                c.CreatedAt AS DateListed,
                c.Status,
                c.FundingGoal,
                c.AmountRaised,
                i.InvestorId,
                u.Fullname AS InvestorName,
                i.Amount AS AmountInvested,
                i.CreatedAt AS InvestmentDate,
                i.EquityAllocated AS AllotedEquity
            FROM Campaigns c
            LEFT JOIN Investments i ON c.Id = i.CampaignId AND i.Status = 'Success'
            LEFT JOIN Users u ON i.InvestorId = u.Id
            WHERE c.FounderId = @UserId
            ORDER BY c.CreatedAt DESC, i.CreatedAt ASC";

                var rawData = await connection.QueryAsync<FundingDetailsReportRaw>(query, new { UserId = userId });

                var groupedData = rawData.GroupBy(c => new { c.CampaignId, c.Title, c.DateListed, c.Status, c.FundingGoal, c.AmountRaised })
                    .Select(group => new FundingDetailsReport
                    {
                        Title = group.Key.Title,
                        DateListed = group.Key.DateListed,
                        Status = group.Key.Status,
                        RemainingAmountNeeded = group.Key.FundingGoal - group.Key.AmountRaised,
                        Investments = group.Where(i => i.InvestorId != null).Select(i => new InvestmentDetails
                        {
                            InvestorName = i.InvestorName,
                            AmountInvested = i.AmountInvested,
                            InvestmentDate = i.InvestmentDate,
                            AllotedEquity = i.AllotedEquity
                        }).ToList()
                    }).ToList();

                return new  
                {
                    TotalCampaignsCreated = groupedData.Count,
                    TotalAmountInvested = groupedData.Sum(c => c.Investments.Sum(i => i.AmountInvested)),
                    Campaigns = groupedData
                };
            }
            else if (role == "Investor")
            {
                var query = @"
            -- Get Investor Summary
            SELECT 
                (SELECT COUNT(DISTINCT CampaignId) FROM Investments WHERE InvestorId = @UserId) AS TotalCampaignsInvested,
                (SELECT COALESCE(SUM(Amount), 0) FROM Investments WHERE InvestorId = @UserId AND Status = 'Success') AS TotalAmountInvested;
            
            -- Get Campaigns Invested In
            SELECT 
                c.Title,
                c.CreatedAt AS DateListed,
                i.CreatedAt AS InvestmentDate,
                i.Status AS InvestmentStatus,
                i.Amount AS AmountInvested,
                c.Status AS CampaignStatus
            FROM Investments i
            JOIN Campaigns c ON i.CampaignId = c.Id
            WHERE i.InvestorId = @UserId
            ORDER BY i.CreatedAt DESC";

                using var multi = await connection.QueryMultipleAsync(query, new { UserId = userId });

                var summary = await multi.ReadFirstOrDefaultAsync<InvestorSummary>() ?? new InvestorSummary();
                var campaigns = (await multi.ReadAsync<InvestorCampaignDetails>()).ToList();

                return new
                {
                    TotalCampaignsInvested = summary.TotalCampaignsInvested,
                    TotalAmountInvested = summary.TotalAmountInvested,
                    Campaigns = campaigns
                };
            }
            else
            {
                throw new ArgumentException("Invalid role");
            }
        }
    }

    public class FundingDetailsReport
    {
        public string Title { get; set; }
        public DateTime DateListed { get; set; }
        public string Status { get; set; }
        public decimal RemainingAmountNeeded { get; set; }
        public List<InvestmentDetails> Investments { get; set; }
    }

    public class InvestmentDetails
    {
        public string InvestorName { get; set; }
        public decimal AmountInvested { get; set; }
        public DateTime InvestmentDate { get; set; }
        public decimal AllotedEquity { get; set; }
    }

    internal class FundingDetailsReportRaw
    {
        public int CampaignId { get; set; }
        public string Title { get; set; }
        public DateTime DateListed { get; set; }
        public string Status { get; set; }
        public decimal FundingGoal { get; set; }
        public decimal AmountRaised { get; set; }
        public int? InvestorId { get; set; }
        public string InvestorName { get; set; }
        public decimal AmountInvested { get; set; }
        public DateTime InvestmentDate { get; set; }
        public decimal AllotedEquity { get; set; }
    }

    public class InvestorSummary
    {
        public int TotalCampaignsInvested { get; set; }
        public decimal TotalAmountInvested { get; set; }
    }

    public class InvestorCampaignDetails
    {
        public string Title { get; set; }
        public DateTime DateListed { get; set; }
        public DateTime InvestmentDate { get; set; }
        public string InvestmentStatus { get; set; }
        public decimal AmountInvested { get; set; }
        public string CampaignStatus { get; set; }
    }
}
