using GraphQLApi.Models;
using HotChocolate;

namespace GraphQLApi.GraphQL.Types;

public class UserType : ObjectType<User>
{
    protected override void Configure(IObjectTypeDescriptor<User> descriptor)
    {
        descriptor.Field(u => u.Id).Type<IdType>();
        descriptor.Field(u => u.Username).Type<StringType>();
        // Don't expose password field
        descriptor.Field(u => u.CreatedAt).Type<DateTimeType>();
    }
}
