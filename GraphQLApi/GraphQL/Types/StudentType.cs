using GraphQLApi.Models;
using HotChocolate;

namespace GraphQLApi.GraphQL.Types;

public class StudentType : ObjectType<Student>
{
    protected override void Configure(IObjectTypeDescriptor<Student> descriptor)
    {
        descriptor.Field(s => s.Id).Type<IdType>();
        descriptor.Field(s => s.StudentId).Type<StringType>();
        descriptor.Field(s => s.FirstName).Type<StringType>();
        descriptor.Field(s => s.LastName).Type<StringType>();
        descriptor.Field(s => s.DateOfBirth).Type<StringType>();
        descriptor.Field(s => s.Gender).Type<StringType>();
        descriptor.Field(s => s.Address).Type<StringType>();
        descriptor.Field(s => s.Email).Type<StringType>();
        descriptor.Field(s => s.PersonalPhone).Type<StringType>();
        descriptor.Field(s => s.EmergencyContact).Type<StringType>();
        descriptor.Field(s => s.EmergencyContactPhone).Type<StringType>();
        descriptor.Field(s => s.Relationship).Type<StringType>();
        descriptor.Field(s => s.Program).Type<StringType>();
        descriptor.Field(s => s.YearLevel).Type<StringType>();
        descriptor.Field(s => s.GradeSchool).Type<StringType>();
        descriptor.Field(s => s.HighSchool).Type<StringType>();
        descriptor.Field(s => s.College).Type<StringType>();
        descriptor.Field(s => s.CreatedAt).Type<DateTimeType>();
        descriptor.Field(s => s.UpdatedAt).Type<DateTimeType>();
    }
}
