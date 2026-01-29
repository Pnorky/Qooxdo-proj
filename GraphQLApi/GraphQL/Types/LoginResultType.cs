using HotChocolate;

namespace GraphQLApi.GraphQL.Types;

public class LoginResultType
{
    public bool Success { get; set; }
    public string? Username { get; set; }
    public string? Message { get; set; }
    public string? Error { get; set; }
}
