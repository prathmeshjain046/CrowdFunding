using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Crowdfunding.API.Controllers
{
    [Route("api/reports")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly IReportManager _reportManager;

        public ReportController(IReportManager reportManager)
        {
            _reportManager = reportManager;
        }

        // Investor-only: returns only the logged-in investor's payments
        [HttpGet("payments")]
        [Authorize(Roles = "Investor")]
        public async Task<IActionResult> GetPaymentReport()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var report = await _reportManager.GetPaymentReport(userId);
            return Ok(report);
        }

        // Founder-only: shares for a specific campaign they own
        [HttpGet("shares/{campaignId}")]
        [Authorize(Roles = "Founder")]
        public async Task<IActionResult> GetSharesAllocatedReport(int campaignId)
        {
            var report = await _reportManager.GetSharesAllocatedReport(campaignId);
            return Ok(report);
        }

        // Any authenticated user: dashboard tailored by role
        [HttpGet("dashboard")]
        [Authorize]
        public async Task<IActionResult> GetDashboardSummary()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var role = User.FindFirstValue(ClaimTypes.Role);

            if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(role))
                return Unauthorized("Invalid or missing token.");

            if (!int.TryParse(userIdClaim, out int userId))
                return BadRequest("Invalid user ID.");

            var dashboardData = await _reportManager.GetDashboardSummary(userId, role);

            if (dashboardData == null)
                return NotFound("No report data available.");

            return Ok(dashboardData);
        }
    }
}
