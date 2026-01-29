using GraphQLApi.Data;
using GraphQLApi.GraphQL.Queries;
using GraphQLApi.GraphQL.Mutations;
using GraphQLApi.GraphQL.Types;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add Entity Framework with SQLite
var dbPath = System.IO.Path.Combine(Directory.GetCurrentDirectory(), "students.db");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

// Add GraphQL services
builder.Services
    .AddGraphQLServer()
    .AddQueryType<Query>()
    .AddMutationType<Mutation>()
    .AddType<StudentType>()
    .AddType<UserType>()
    .AddType<LoginResultType>()
    .AddProjections()
    .AddFiltering()
    .AddSorting();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Initialize database
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await DatabaseInitializer.InitializeAsync(dbContext);
}

// Configure the HTTP request pipeline
app.UseCors();
app.UseRouting();

// Map GraphQL endpoint
app.MapGraphQL();

// Health check endpoint
app.MapGet("/api/health", () => new { status = "OK", message = "Server is running" });

app.Run();
