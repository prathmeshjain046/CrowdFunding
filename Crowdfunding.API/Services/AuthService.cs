using Crowdfunding.API.Repositories;
using Crowdfunding.API.Models;

namespace Crowdfunding.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly JwtService _jwtService;

        public AuthService(IUserRepository userRepository, JwtService jwtService)
        {
            _userRepository = userRepository;
            _jwtService = jwtService;
        }

        public async Task<int> RegisterUser(UserDto userDto)
        {
            var existing = await _userRepository.GetUserByEmail(userDto.Email);
            if (existing != null)
                throw new Exception("User already exists.");

            return await _userRepository.RegisterUser(userDto);
        }

        public async Task<string?> AuthenticateUser(UserDto loginDto)
        {
            var user = await _userRepository.GetUserByEmail(loginDto.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
                return null;

            return _jwtService.GenerateToken(user);
        }

        public async Task<User?> GetUserProfile(int userId)
            => await _userRepository.GetUserById(userId);

        public async Task UpdateProfile(int userId, UpdateProfileDto dto)
            => await _userRepository.UpdateUser(userId, dto);
    }
}
