using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using Crowdfunding.API.Data;
using Crowdfunding.API.Repositories;
using Crowdfunding.API.Services;
using Crowdfunding.API.Managers;
using Crowdfunding.API.Models;
using Crowdfunding.API.Managers.Interfaces;
using Crowdfunding.API.Repositories.Interfaces;
using Crowdfunding.API.Manager;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// HttpClient for PaymentsController (PayPal verify)
builder.Services.AddHttpClient();

// Swagger with JWT auth
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Crowdfunding API", Version = "v1" });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token in the format: Bearer your_token_here"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Core services
builder.Services.AddSingleton<DapperContext>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// PayPal — use IHttpClientFactory (no more new HttpClient() inside service)
builder.Services.Configure<PayPalSettings>(builder.Configuration.GetSection("PayPal"));
builder.Services.AddHttpClient<PayPalService>();

// Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ICampaignRepository, CampaignRepository>();
builder.Services.AddScoped<IInvestmentRepository, InvestmentRepository>();
builder.Services.AddScoped<IReportRepository, ReportRepository>();

// Managers
builder.Services.AddScoped<ICampaignManager, CampaignManager>();
builder.Services.AddScoped<IInvestmentManager, InvestmentManager>();
builder.Services.AddScoped<IReportManager, ReportManager>();
builder.Services.AddScoped<IPaymentManager, PaymentManager>();   // Stripe (future use)

// JWT Authentication
var jwtKey = builder.Configuration["JwtSettings:Key"]
    ?? throw new InvalidOperationException("JwtSettings:Key is not configured.");
var key = Encoding.UTF8.GetBytes(jwtKey);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
            ValidAudience = builder.Configuration["JwtSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };
    });

// CORS — localhost:3000 for dev; tighten to real domain before deploying
builder.Services.AddCors(options =>
{
    options.AddPolicy("_myCorsPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Kestrel port comes from appsettings.json (http://0.0.0.0:8080)
// DO NOT override with ConfigureKestrel here — it was hardcoding port 5050

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("_myCorsPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
