/**
 * Application wiring: backend REST vs local-only (demo) mode.
 * Set USE_API to true when your API server is available.
 */
qx.Class.define("myapp.Config", {
  statics: {
    /** When false, login/register/students work offline with mock data (no fetch to backend). */
    USE_API: false,

    /** Base URL for REST calls (only used when USE_API is true). */
    API_BASE_URL: "http://localhost:3000",

    /**
     * @param {string} path e.g. "/api/students"
     */
    getApiUrl(path: string): string {
      const base = String(this.API_BASE_URL || "").replace(/\/$/, "");
      const p = path.startsWith("/") ? path : `/${path}`;
      return `${base}${p}`;
    },

    /** Sample rows for student table when USE_API is false. */
    getMockStudents(): any[] {
      return [
        {
          id: "local-1",
          studentId: "2024-001",
          firstName: "Maria",
          lastName: "Santos",
          program: "BS Computer Science",
          yearLevel: "1",
          dateOfBirth: null,
          gender: "Female",
          address: "123 Campus Ave (demo)",
          email: "maria.santos@example.edu",
          personalPhone: "09171234567",
          emergencyContact: "Parent",
          emergencyContactPhone: "09170000000",
          relationship: "Mother",
          gradeSchool: "",
          highSchool: "",
          college: ""
        },
        {
          id: "local-2",
          studentId: "2024-002",
          firstName: "Juan",
          lastName: "Dela Cruz",
          program: "BS Information Technology",
          yearLevel: "2",
          dateOfBirth: null,
          gender: "Male",
          address: "456 University Rd (demo)",
          email: "juan.delacruz@example.edu",
          personalPhone: "09179876543",
          emergencyContact: "Guardian",
          emergencyContactPhone: "09171112222",
          relationship: "Uncle",
          gradeSchool: "",
          highSchool: "",
          college: ""
        }
      ];
    }
  }
});
