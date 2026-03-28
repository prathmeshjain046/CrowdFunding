using System.ComponentModel.DataAnnotations;

namespace Crowdfunding.API.Models
{
    public class Investment
    {
        public int Id { get; set; }
        public int InvestorId { get; set; }  // set server-side from JWT

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "CampaignId must be a valid ID.")]
        public int CampaignId { get; set; }

        [Range(1, double.MaxValue, ErrorMessage = "Investment amount must be at least $1.")]
        public decimal Amount { get; set; }

        public decimal EquityAllocated { get; set; }  // calculated server-side
        public string Status { get; set; } = "Pending";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
