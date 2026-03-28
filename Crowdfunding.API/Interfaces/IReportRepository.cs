using Crowdfunding.API.Models;

namespace Crowdfunding.API.Repositories
{
    public interface IReportRepository
    {
        Task<IEnumerable<Investment>> GetPaymentReport(int investorId);
        Task<IEnumerable<dynamic>> GetSharesAllocatedReport(int campaignId);
        Task<dynamic> GetDashboardSummary(int userId, string role);
    }
}
