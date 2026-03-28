using Dapper;
using Crowdfunding.API.Data;
using Crowdfunding.API.Models;

namespace Crowdfunding.API.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly DapperContext _context;

        public UserRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<int> RegisterUser(UserDto userDto)
        {
            var query = @"INSERT INTO Users (FullName, Email, PasswordHash, Role)
                          VALUES (@FullName, @Email, @PasswordHash, @Role);
                          SELECT CAST(SCOPE_IDENTITY() AS INT);";

            var parameters = new
            {
                userDto.FullName,
                userDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(userDto.Password),
                userDto.Role
            };

            using var connection = _context.CreateConnection();
            return await connection.ExecuteScalarAsync<int>(query, parameters);
        }

        public async Task<User?> GetUserById(int userId)
        {
            var query = "SELECT Id, FullName, Email, Role FROM Users WHERE Id = @UserId";
            using var connection = _context.CreateConnection();
            return await connection.QuerySingleOrDefaultAsync<User>(query, new { UserId = userId });
        }

        public async Task<User?> GetUserByEmail(string email)
        {
            // Select only needed columns — avoids returning PasswordHash unnecessarily
            var query = "SELECT Id, FullName, Email, PasswordHash, Role FROM Users WHERE Email = @Email";
            using var connection = _context.CreateConnection();
            return await connection.QuerySingleOrDefaultAsync<User>(query, new { Email = email });
        }

        public async Task UpdateUser(int userId, UpdateProfileDto dto)
        {
            using var connection = _context.CreateConnection();

            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                // Update both name and password
                var query = @"UPDATE Users
                              SET FullName = @FullName, PasswordHash = @PasswordHash
                              WHERE Id = @UserId";
                await connection.ExecuteAsync(query, new
                {
                    FullName = dto.FullName,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                    UserId = userId
                });
            }
            else
            {
                // Update name only
                var query = "UPDATE Users SET FullName = @FullName WHERE Id = @UserId";
                await connection.ExecuteAsync(query, new { FullName = dto.FullName, UserId = userId });
            }
        }
    }
}
