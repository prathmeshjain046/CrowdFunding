using System.ComponentModel.DataAnnotations;

namespace Crowdfunding.API.Models
{
    public class UpdateProfileDto
    {
        [Required]
        [StringLength(200, MinimumLength = 2)]
        public string FullName { get; set; } = string.Empty;

        // Null = don't change password
        [MinLength(6)]
        public string? Password { get; set; }
    }
}
