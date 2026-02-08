# .NET 10 + GraphQL — Zero to Hero

A minimal **ASP.NET Core 10** API using **HotChocolate** for GraphQL, **Entity Framework Core 10** with **SQLite**, and a clean folder structure. This guide walks you from setup to running queries and mutations.

**Re-create this project in Visual Studio:** see [TUTORIAL-VISUAL-STUDIO.md](TUTORIAL-VISUAL-STUDIO.md) for a step-by-step tutorial.

---

## Stack

| Component | Version / Choice |
|-----------|------------------|
| .NET | 10 |
| GraphQL server | HotChocolate 15.x |
| ORM | Entity Framework Core 10 |
| Database | SQLite (file: `students.db`) |
| IDE for GraphQL | Banana Cake Pop (built-in at `/graphql` in Development) |

---

## Project structure

```
GraphQLApi/
├── Program.cs                 # App bootstrap, DbContext, GraphQL, CORS
├── Data/
│   ├── AppDbContext.cs       # EF DbContext (Students, Users)
│   └── DatabaseInitializer.cs # Ensures DB exists + default admin user
├── Models/
│   ├── Student.cs            # Student entity
│   └── User.cs               # User entity (login/register)
├── GraphQL/
│   ├── Queries/
│   │   └── Query.cs          # Root query: getStudents, getStudent, getStudentByStudentId
│   ├── Mutations/
│   │   └── Mutation.cs       # Root mutation: add/update/delete student, login, register
│   └── Types/
│       ├── StudentType.cs    # GraphQL type for Student
│       ├── UserType.cs       # GraphQL type for User (no password)
│       └── LoginResultType.cs # Result type for login
└── students.db               # SQLite DB (created on first run)
```

---

## Zero: Run the API

```bash
cd GraphQLApi
dotnet run
```

- **GraphQL endpoint:** `https://localhost:5xxx/graphql` (or the port shown in the console).
- **Banana Cake Pop (GraphQL IDE):** open `https://localhost:5xxx/graphql` in a browser (only in Development).
- **Health check:** `GET https://localhost:5xxx/api/health`.

---

## 1. GraphQL concepts in this project

- **Schema:** One **Query** root (read) and one **Mutation** root (write).
- **Types:** `Student`, `User`, `LoginResult`, etc. map to C# classes; HotChocolate infers or you define them with `ObjectType<T>`.
- **Resolvers:** Methods on `Query` and `Mutation`; `[Service] AppDbContext context` injects the DB.
- **Inputs:** Records like `AddStudentInput`, `UpdateStudentInput`, `LoginInput`, `RegisterInput` for mutation arguments.

---

## 2. Queries (read)

Defined in `GraphQL/Queries/Query.cs`:

| Field | Description |
|-------|-------------|
| `getStudents` | List all students (with projection, filtering, sorting) |
| `getStudent(id: Int!)` | Student by database `id` |
| `getStudentByStudentId(studentId: String!)` | Student by `studentId` |

**Example: get all students (selected fields)**

```graphql
query {
  getStudents {
    id
    studentId
    firstName
    lastName
    yearLevel
    createdAt
  }
}
```

**Example: get one student**

```graphql
query {
  getStudent(id: 1) {
    id
    studentId
    firstName
    lastName
    email
    program
    yearLevel
  }
}
```

**Example: filtering and sorting (HotChocolate.Data)**

```graphql
query {
  getStudents(
    where: { lastName: { contains: "Smith" } }
    order: { createdAt: DESC }
  ) {
    id
    firstName
    lastName
  }
}
```

---

## 3. Mutations (write)

Defined in `GraphQL/Mutations/Mutation.cs`:

| Mutation | Purpose |
|----------|--------|
| `addStudent(input: AddStudentInput!)` | Create a student |
| `updateStudent(id: Int!, input: UpdateStudentInput!)` | Update a student |
| `deleteStudent(id: Int!)` | Delete a student |
| `login(input: LoginInput!)` | Authenticate (returns `LoginResult`) |
| `register(input: RegisterInput!)` | Create user (returns `RegisterResult`) |

**Example: add student**

```graphql
mutation {
  addStudent(input: {
    studentId: "2024-001"
    firstName: "Jane"
    lastName: "Doe"
    program: "BSIT"
    yearLevel: "1"
  }) {
    id
    studentId
    firstName
    lastName
    program
    yearLevel
  }
}
```

**Example: update student**

```graphql
mutation {
  updateStudent(id: 1, input: {
    firstName: "Jane"
    lastName: "Doe-Smith"
    yearLevel: "2"
  }) {
    id
    firstName
    lastName
    yearLevel
  }
}
```

**Example: delete student**

```graphql
mutation {
  deleteStudent(id: 1)
}
```

**Example: login (default user: admin / admin)**

```graphql
mutation {
  login(input: { username: "admin", password: "admin" }) {
    success
    username
    message
    error
  }
}
```

**Example: register**

```graphql
mutation {
  register(input: { username: "newuser", password: "secret123" }) {
    success
    username
    message
    error
  }
}
```

---

## 4. Key code patterns

### Program.cs — wiring

- **DbContext:** SQLite with file `students.db`.
- **GraphQL:** `AddGraphQLServer()` + `AddQueryType<Query>()` + `AddMutationType<Mutation>()`, then types and `AddProjections()`, `AddFiltering()`, `AddSorting()`.
- **CORS:** Allow all origins (customize in production).
- **Map:** `MapGraphQL()` with Banana Cake Pop enabled in Development.

### Resolvers and dependency injection

```csharp
public async Task<List<Student>> GetStudents([Service] AppDbContext context)
{
    return await context.Students.OrderByDescending(s => s.CreatedAt).ToListAsync();
}
```

`[Service]` injects the registered `AppDbContext`.

### Custom types (optional)

If you need to hide or rename fields or change types, use `ObjectType<T>`:

```csharp
public class StudentType : ObjectType<Student>
{
    protected override void Configure(IObjectTypeDescriptor<Student> descriptor)
    {
        descriptor.Field(s => s.Id).Type<IdType>();
        descriptor.Field(s => s.StudentId).Type<StringType>();
        // ...
    }
}
```

`UserType` omits the password field for security.

### Errors

Throw `GraphQLException("message")` for domain errors (e.g. “Student not found”, “Student ID already exists”); HotChocolate exposes them in the GraphQL response.

---

## 5. Quick reference

- **Explore schema:** Open `/graphql` in the browser (Banana Cake Pop) and use the “Schema” tab.
- **Database:** SQLite file `students.db` in the project directory; default user `admin` / `admin` is created if the `Users` table is empty.
- **Year level:** Stored and normalized to a string (e.g. "1"–"4"); formats like "p4", "1st Year" are normalized in resolvers.

---

## 6. Next steps (from zero to hero)

1. **Auth:** Add JWT or cookies and use HotChocolate’s authorization to protect queries/mutations.
2. **Validation:** Use FluentValidation or Data Annotations for inputs.
3. **Pagination:** Use `[UsePaging]` and `GetConnection()` for cursor-based pagination on lists.
4. **Subscriptions:** Add `AddSubscriptionType<>` and a transport (e.g. WebSockets) for real-time updates.
5. **Production:** Restrict CORS, use HTTPS, hash passwords, and run migrations instead of `EnsureCreatedAsync()`.

You now have a working .NET 10 + GraphQL API from zero to hero.
