# GraphQLApi Status

**Temporarily Disabled**

This GraphQL API is currently not in use. The project is using the **backend** REST API instead.

## To Re-enable GraphQLApi

1. Update frontend API calls to use GraphQL endpoints
2. Change API base URL from `http://localhost:3000` to `http://localhost:5094` (or the configured GraphQL port)
3. Convert REST API calls to GraphQL queries/mutations
4. Start the GraphQLApi server: `cd GraphQLApi && dotnet run`

## Current Active API

- **Backend REST API**: `backend/` folder
- **Server**: `http://localhost:3000`
- **Protocol**: REST (HTTP GET/POST/PUT/DELETE)
