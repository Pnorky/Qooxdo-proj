using GraphQLApi.Data;
using GraphQLApi.Models;
using GraphQLApi.GraphQL.Types;
using HotChocolate;
using Microsoft.EntityFrameworkCore;

namespace GraphQLApi.GraphQL.Mutations;

public class Mutation
{
    public async Task<Student> AddStudent(
        AddStudentInput input,
        [Service] AppDbContext context)
    {
        // Check if studentId already exists
        var existingStudent = await context.Students
            .FirstOrDefaultAsync(s => s.StudentId == input.StudentId);
        
        if (existingStudent != null)
        {
            throw new GraphQLException("Student ID already exists");
        }

        var normalizedYearLevel = NormalizeYearLevel(input.YearLevel);
        var dobString = input.DateOfBirth?.ToString("yyyy-MM-dd");

        var student = new Student
        {
            StudentId = input.StudentId,
            FirstName = input.FirstName,
            LastName = input.LastName,
            DateOfBirth = dobString,
            Gender = input.Gender,
            Address = input.Address,
            Email = input.Email,
            PersonalPhone = input.PersonalPhone,
            EmergencyContact = input.EmergencyContact,
            EmergencyContactPhone = input.EmergencyContactPhone,
            Relationship = input.Relationship,
            Program = input.Program,
            YearLevel = normalizedYearLevel,
            GradeSchool = input.GradeSchool,
            HighSchool = input.HighSchool,
            College = input.College,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Students.Add(student);
        await context.SaveChangesAsync();

        student.YearLevel = normalizedYearLevel;
        return student;
    }

    public async Task<Student> UpdateStudent(
        int id,
        UpdateStudentInput input,
        [Service] AppDbContext context)
    {
        var student = await context.Students.FindAsync(id);
        
        if (student == null)
        {
            throw new GraphQLException("Student not found");
        }

        // Check if studentId is being changed and if it already exists
        if (input.StudentId != null && input.StudentId != student.StudentId)
        {
            var existingStudent = await context.Students
                .FirstOrDefaultAsync(s => s.StudentId == input.StudentId && s.Id != id);
            
            if (existingStudent != null)
            {
                throw new GraphQLException("Student ID already exists");
            }
        }

        var normalizedYearLevel = NormalizeYearLevel(input.YearLevel);
        var dobString = input.DateOfBirth?.ToString("yyyy-MM-dd");

        // Update properties
        if (input.StudentId != null) student.StudentId = input.StudentId;
        if (input.FirstName != null) student.FirstName = input.FirstName;
        if (input.LastName != null) student.LastName = input.LastName;
        if (input.DateOfBirth != null) student.DateOfBirth = dobString;
        if (input.Gender != null) student.Gender = input.Gender;
        if (input.Address != null) student.Address = input.Address;
        if (input.Email != null) student.Email = input.Email;
        if (input.PersonalPhone != null) student.PersonalPhone = input.PersonalPhone;
        if (input.EmergencyContact != null) student.EmergencyContact = input.EmergencyContact;
        if (input.EmergencyContactPhone != null) student.EmergencyContactPhone = input.EmergencyContactPhone;
        if (input.Relationship != null) student.Relationship = input.Relationship;
        if (input.Program != null) student.Program = input.Program;
        if (input.YearLevel != null) student.YearLevel = normalizedYearLevel;
        if (input.GradeSchool != null) student.GradeSchool = input.GradeSchool;
        if (input.HighSchool != null) student.HighSchool = input.HighSchool;
        if (input.College != null) student.College = input.College;
        
        student.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();
        student.YearLevel = normalizedYearLevel;
        return student;
    }

    public async Task<bool> DeleteStudent(
        int id,
        [Service] AppDbContext context)
    {
        var student = await context.Students.FindAsync(id);
        
        if (student == null)
        {
            throw new GraphQLException("Student not found");
        }

        context.Students.Remove(student);
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<LoginResultType> Login(
        LoginInput input,
        [Service] AppDbContext context)
    {
        if (string.IsNullOrWhiteSpace(input.Username) || string.IsNullOrWhiteSpace(input.Password))
        {
            return new LoginResultType
            {
                Success = false,
                Error = "Username and password are required"
            };
        }

        var user = await context.Users
            .FirstOrDefaultAsync(u => u.Username == input.Username);

        if (user == null || user.Password != input.Password)
        {
            return new LoginResultType
            {
                Success = false,
                Error = "Invalid username or password"
            };
        }

        return new LoginResultType
        {
            Success = true,
            Username = user.Username,
            Message = "Login successful"
        };
    }

    public async Task<RegisterResultType> Register(
        RegisterInput input,
        [Service] AppDbContext context)
    {
        if (string.IsNullOrWhiteSpace(input.Username) || string.IsNullOrWhiteSpace(input.Password))
        {
            return new RegisterResultType
            {
                Success = false,
                Error = "Username and password are required"
            };
        }

        if (input.Username.Length < 3)
        {
            return new RegisterResultType
            {
                Success = false,
                Error = "Username must be at least 3 characters"
            };
        }

        if (input.Password.Length < 3)
        {
            return new RegisterResultType
            {
                Success = false,
                Error = "Password must be at least 3 characters"
            };
        }

        // Check if username already exists
        var existingUser = await context.Users
            .FirstOrDefaultAsync(u => u.Username == input.Username);

        if (existingUser != null)
        {
            return new RegisterResultType
            {
                Success = false,
                Error = "Username already exists"
            };
        }

        var user = new User
        {
            Username = input.Username,
            Password = input.Password,
            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(user);
        await context.SaveChangesAsync();

        return new RegisterResultType
        {
            Success = true,
            Username = user.Username,
            Message = "User registered successfully"
        };
    }

    /// <summary>
    /// Normalize year level to numeric string (1-4)
    /// </summary>
    private static string? NormalizeYearLevel(string? yearLevel)
    {
        if (string.IsNullOrWhiteSpace(yearLevel))
            return null;

        var match = System.Text.RegularExpressions.Regex.Match(yearLevel, @"(\d+)");
        if (match.Success)
        {
            var num = int.Parse(match.Groups[1].Value);
            if (num >= 1 && num <= 4)
            {
                return num.ToString();
            }
        }

        return yearLevel;
    }
}

// Input types
public record AddStudentInput(
    string StudentId,
    string FirstName,
    string LastName,
    DateTime? DateOfBirth,
    string? Gender,
    string? Address,
    string? Email,
    string? PersonalPhone,
    string? EmergencyContact,
    string? EmergencyContactPhone,
    string? Relationship,
    string? Program,
    string? YearLevel,
    string? GradeSchool,
    string? HighSchool,
    string? College
);

public record UpdateStudentInput(
    string? StudentId,
    string? FirstName,
    string? LastName,
    DateTime? DateOfBirth,
    string? Gender,
    string? Address,
    string? Email,
    string? PersonalPhone,
    string? EmergencyContact,
    string? EmergencyContactPhone,
    string? Relationship,
    string? Program,
    string? YearLevel,
    string? GradeSchool,
    string? HighSchool,
    string? College
);

public record LoginInput(string Username, string Password);

public record RegisterInput(string Username, string Password);

public class RegisterResultType
{
    public bool Success { get; set; }
    public string? Username { get; set; }
    public string? Message { get; set; }
    public string? Error { get; set; }
}
