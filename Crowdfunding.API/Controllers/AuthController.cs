using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Crowdfunding.API.Models;
using Crowdfunding.API.Services;
using System.Security.Claims;

namespace Crowdfunding.API.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] UserDto userDto)
        {
            try
            {
                var userId = await _authService.RegisterUser(userDto);
                return Ok(new { Message = "User registered successfully.", UserId = userId });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] UserDto loginDto)
        {
            var token = await _authService.AuthenticateUser(loginDto);
            if (token == null)
                return Unauthorized(new { error = "Invalid credentials." });

            return Ok(new { Token = token });
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("Invalid user ID.");

            var user = await _authService.GetUserProfile(int.Parse(userIdClaim));
            if (user == null)
                return NotFound("User not found.");

            return Ok(new
            {
                user.Id,
                user.FullName,
                user.Email,
                user.Role
            });
        }

        [HttpPut("update-profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("Invalid user ID.");

            await _authService.UpdateProfile(int.Parse(userIdClaim), dto);
            return Ok(new { Message = "Profile updated successfully." });
        }
    }
}
