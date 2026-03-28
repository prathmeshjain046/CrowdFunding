using Crowdfunding.API.Models;

public interface IAuthService
{
    Task<int> RegisterUser(UserDto userDto);
    Task<string?> AuthenticateUser(UserDto loginDto);
    Task<User?> GetUserProfile(int userId);
    Task UpdateProfile(int userId, UpdateProfileDto dto);
}
