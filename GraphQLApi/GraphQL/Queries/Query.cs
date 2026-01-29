using GraphQLApi.Data;
using GraphQLApi.Models;
using HotChocolate;
using HotChocolate.Data;
using Microsoft.EntityFrameworkCore;

namespace GraphQLApi.GraphQL.Queries;

public class Query
{
    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public async Task<List<Student>> GetStudents([Service] AppDbContext context)
    {
        var students = await context.Students
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
        
        // Normalize yearLevel for all students
        foreach (var student in students)
        {
            student.YearLevel = NormalizeYearLevel(student.YearLevel);
        }
        
        return students;
    }

    public async Task<Student?> GetStudent(int id, [Service] AppDbContext context)
    {
        var student = await context.Students.FirstOrDefaultAsync(s => s.Id == id);
        if (student != null)
        {
            student.YearLevel = NormalizeYearLevel(student.YearLevel);
        }
        return student;
    }

    public async Task<Student?> GetStudentByStudentId(string studentId, [Service] AppDbContext context)
    {
        var student = await context.Students.FirstOrDefaultAsync(s => s.StudentId == studentId);
        if (student != null)
        {
            student.YearLevel = NormalizeYearLevel(student.YearLevel);
        }
        return student;
    }

    /// <summary>
    /// Normalize year level to numeric string (1-4)
    /// Handles formats like "p4", "rr3", "r2", "4", "1st Year", "2nd Year", etc.
    /// </summary>
    private static string? NormalizeYearLevel(string? yearLevel)
    {
        if (string.IsNullOrWhiteSpace(yearLevel))
            return null;

        // Extract the last digit from the string
        var match = System.Text.RegularExpressions.Regex.Match(yearLevel, @"(\d+)");
        if (match.Success)
        {
            var num = int.Parse(match.Groups[1].Value);
            // Ensure it's between 1-4 (valid year levels)
            if (num >= 1 && num <= 4)
            {
                return num.ToString();
            }
        }

        return yearLevel; // Return original if no valid number found
    }
}
