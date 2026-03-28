using System.ComponentModel.DataAnnotations;

namespace Crowdfunding.API.Models
{
    public class UserDto
    {
        [Required]
        [StringLength(200, MinimumLength = 2)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters.")]
        public string Password { get; set; } = string.Empty;

        [Required]
        [RegularExpression("^(Investor|Founder)$", ErrorMessage = "Role must be Investor or Founder.")]
        public string Role { get; set; } = "Investor";
    }
}
