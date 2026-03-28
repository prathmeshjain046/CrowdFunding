using System.ComponentModel.DataAnnotations;

namespace Crowdfunding.API.Models
{
    public class Campaign
    {
        public int Id { get; set; }
        public int FounderId { get; set; }  // set server-side from JWT, never trusted from body

        [Required]
        [StringLength(200, MinimumLength = 3)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(5000, MinimumLength = 10)]
        public string Description { get; set; } = string.Empty;

        [Range(1, double.MaxValue, ErrorMessage = "Funding goal must be greater than 0.")]
        public decimal FundingGoal { get; set; }

        [Range(0.01, 100, ErrorMessage = "Equity offered must be between 0.01% and 100%.")]
        public decimal EquityOffered { get; set; }

        public decimal AmountRaised { get; set; } = 0;
        public string Status { get; set; } = "Active";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
