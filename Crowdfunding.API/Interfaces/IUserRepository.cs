using Crowdfunding.API.Models;

namespace Crowdfunding.API.Repositories
{
    public interface IUserRepository
    {
        Task<int> RegisterUser(UserDto userDto);
        Task<User?> GetUserById(int userId);
        Task<User?> GetUserByEmail(string email);
        Task UpdateUser(int userId, UpdateProfileDto dto);
    }
}
