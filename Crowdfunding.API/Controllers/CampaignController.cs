
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Crowdfunding.API.Models;
using Crowdfunding.API.Managers.Interfaces;
using System.Security.Claims;

namespace Crowdfunding.API.Controllers
{
    [Route("api/campaigns")]
    [ApiController]
    public class CampaignController : ControllerBase
    {
        private readonly ICampaignManager _campaignManager;

        public CampaignController(ICampaignManager campaignManager)
        {
            _campaignManager = campaignManager;
        }

        [HttpPost("create")]
        [Authorize(Roles = "Founder")]
        public async Task<IActionResult> CreateCampaign([FromBody] Campaign campaign)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("Invalid or missing token.");

            campaign.FounderId = int.Parse(userId);
            var campaignId = await _campaignManager.CreateCampaign(campaign);
            return Ok(new { Message = "Campaign created successfully!", CampaignId = campaignId });
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllCampaigns()
        {
            var campaigns = await _campaignManager.GetAllCampaigns();
            return Ok(campaigns);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCampaignById(int id)
        {
            var campaign = await _campaignManager.GetCampaignById(id);
            if (campaign == null) return NotFound("Campaign not found");
            return Ok(campaign);
        }

        [HttpGet("founder")]
        [Authorize(Roles = "Founder")]
        public async Task<IActionResult> GetCampaignsByFounderId()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("Invalid or missing token.");

            var campaigns = await _campaignManager.GetCampaignsByFounderId(int.Parse(userId));
            return Ok(campaigns);
        }

        [HttpPut("{campaignId}/status")]
        [Authorize(Roles = "Founder")]
        public async Task<IActionResult> UpdateCampaignStatus(int campaignId, [FromBody] UpdateCampaignStatusDto request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("Invalid or missing token.");

            var campaign = await _campaignManager.GetCampaignById(campaignId);
            if (campaign == null)
                return NotFound("Campaign not found.");

            if (campaign.FounderId != int.Parse(userId))
                return Forbid("You are not authorized to update this campaign.");

            if (request.Status != "Active" && request.Status != "Funded" && request.Status != "Closed")
                return BadRequest("Invalid status update.");

            await _campaignManager.UpdateCampaignStatus(campaignId, int.Parse(userId), request.Status);
            return Ok(new { message = "Campaign status updated successfully.", campaignId, status = request.Status });
        }
    }

    public class UpdateCampaignStatusDto
    {
        public string Status { get; set; }
    }
}
