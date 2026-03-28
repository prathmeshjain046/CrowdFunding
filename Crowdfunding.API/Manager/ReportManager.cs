using Crowdfunding.API.Models;
using Crowdfunding.API.Repositories;

public class ReportManager : IReportManager
{
    private readonly IReportRepository _reportRepository;

    public ReportManager(IReportRepository reportRepository)
    {
        _reportRepository = reportRepository;
    }

    public async Task<IEnumerable<Investment>> GetPaymentReport(int investorId)
        => await _reportRepository.GetPaymentReport(investorId);

    public async Task<IEnumerable<dynamic>> GetSharesAllocatedReport(int campaignId)
        => await _reportRepository.GetSharesAllocatedReport(campaignId);

    public async Task<dynamic> GetDashboardSummary(int userId, string role)
        => await _reportRepository.GetDashboardSummary(userId, role);
}
