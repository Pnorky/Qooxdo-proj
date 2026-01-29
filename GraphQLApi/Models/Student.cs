namespace GraphQLApi.Models;

public class Student
{
    public int Id { get; set; }
    public string StudentId { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? Address { get; set; }
    public string? Email { get; set; }
    public string? PersonalPhone { get; set; }
    public string? EmergencyContact { get; set; }
    public string? EmergencyContactPhone { get; set; }
    public string? Relationship { get; set; }
    public string? Program { get; set; }
    public string? YearLevel { get; set; }
    public string? GradeSchool { get; set; }
    public string? HighSchool { get; set; }
    public string? College { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
