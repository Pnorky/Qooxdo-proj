# Student Registration System

A Qooxdoo-based frontend application with a Node.js/Express REST API backend.

## Current API Configuration

**ACTIVE API: Backend REST API (Node.js/Express)**
- Location: `backend/` folder
- Server: `http://localhost:3000`
- Endpoints: `/api/students`, `/api/auth`
- Database: SQLite (`backend/students.db`)

**GraphQLApi is currently disabled/temporarily not in use**
- Location: `GraphQLApi/` folder
- This is a .NET/C# GraphQL API using HotChocolate
- Not currently connected to the frontend

## Quick Start

### 1. Start the Backend Server

```bash
npm install
npm run server
```

The backend server will start on `http://localhost:3000`

### 2. Build and Run the Frontend

```bash
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