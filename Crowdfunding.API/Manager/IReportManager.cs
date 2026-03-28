using Crowdfunding.API.Models;

public interface IReportManager
{
    Task<IEnumerable<Investment>> GetPaymentReport(int investorId);
    Task<IEnumerable<dynamic>> GetSharesAllocatedReport(int campaignId);
    Task<dynamic> GetDashboardSummary(int userId, string role);
}
