# Backend API - Student Registration System

This is a simple Express.js + SQLite backend for the Student Registration System.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm run server
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication

- **POST** `/api/auth/login` - Login with username and password
- **POST** `/api/auth/register` - Register a new user (optional)

### Students

- **GET** `/api/students` - Get all students
- **GET** `/api/students/:id` - Get student by ID
- **GET** `/api/students/studentId/:studentId` - Get student by studentId
- **POST** `/api/students` - Create new student
- **PUT** `/api/students/:id` - Update student
- **DELETE** `/api/students/:id` - Delete student

### Health Check

- **GET** `/api/health` - Check if server is running

## Database

The SQLite database file (`students.db`) will be created automatically in the `backend` folder on first run.

## Default Login Credentials

On first run, a default admin user is created:
- **Username:** `admin`
- **Password:** `admin`

## Example API Usage

### Login:
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin"
}
```

### Create a student:
```bash
POST http://localhost:3000/api/students
Content-Type: application/json

{
  "studentId": "STU001",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "2000-01-01",
  "gender": "Male",
  "address": "123 Main St",
  "email": "john@example.com",
  "personalPhone": "555-0100",
  "emergencyContact": "Jane Doe",
  "emergencyContactPhone": "555-0101",
  "relationship": "Mother",
  "program": "Bachelor of Science in Computer Science",
  "yearLevel": "3",
  "gradeSchool": "Elementary School",
  "highSchool": "High School",
  "college": "Previous College"
}
```

### Get all students:
```bash
GET http://localhost:3000/api/students
```
