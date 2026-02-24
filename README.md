# Student Registration System

A Qooxdoo-based frontend application with a .NET/C# GraphQL API backend.

## Current API Configuration

**ACTIVE API: GraphQLApi (.NET/C# GraphQL)**
- Location: `GraphQLApi/` folder
- Server: `http://localhost:5094`
- Endpoint: `/graphql`
- Database: SQLite (`GraphQLApi/students.db`)
- GraphQL Playground: Available at `http://localhost:5094/graphql` (if configured)

**Backend REST API is deprecated**
- Location: `backend/` folder (archived)
- This was the previous Node.js/Express REST API
- No longer used by the frontend

## Quick Start

### 1. Start the GraphQL API Server

Navigate to the `GraphQLApi/` directory and run:

```bash
dotnet run
# or for development:
dotnet watch run
```

The GraphQL API server will start on `http://localhost:5094`

### 2. Build and Run the Frontend

```bash
npm install
npm run compile
# or for development with watch mode:
npm run watch
```

Then open `source/boot/index.html` in a browser, or use `qx serve` for development.

## Project Structure

- `backend/` - Node.js/Express REST API (ACTIVE)
- `GraphQLApi/` - .NET GraphQL API (temporarily disabled)
- `source/` - Qooxdoo frontend application
- `compiled/` - Compiled frontend output

## Default Login Credentials

- Username: `admin`
- Password: `admin`

## API Documentation

See `backend/README.md` for detailed API endpoint documentation.