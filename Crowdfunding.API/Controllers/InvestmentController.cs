using Crowdfunding.API.Managers.Interfaces;
using Crowdfunding.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Crowdfunding.API.Controllers
{
    [Route("api/investments")]
    [ApiController]
    public class InvestmentController : ControllerBase
    {
        private readonly IInvestmentManager _investmentManager;

        public InvestmentController(IInvestmentManager investmentManager)
        {
            _investmentManager = investmentManager;
        }

        [HttpPost("invest")]
        [Authorize(Roles = "Investor")]
        public async Task<IActionResult> InvestInCampaign([FromBody] Investment investment)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var investmentId = await _investmentManager.InvestInCampaign(investment, userId);
            return Ok(new { Message = "Investment recorded, awaiting payment confirmation.", InvestmentId = investmentId });
        }

        [HttpGet("my-investments")]
        [Authorize(Roles = "Investor")]
        public async Task<IActionResult> GetMyInvestments()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var investments = await _investmentManager.GetInvestmentsByUser(userId);
            return Ok(investments);
        }

        [HttpPost("confirm-payment/{investmentId}")]
        [Authorize(Roles = "Investor")]
        public async Task<IActionResult> ConfirmPayment(int investmentId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var success = await _investmentManager.ConfirmPayment(investmentId, userId);
            if (!success)
                return BadRequest("Payment failed or investment not found.");

            return Ok(new { Message = "Payment successful, shares allocated!", InvestmentId = investmentId });
        }
    }
}

