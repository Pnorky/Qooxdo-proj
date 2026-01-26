/**
 * @asset(qooxdo_proj/*)
 */
qx.Class.define("qooxdo_proj.Application",
  {
    extend: qx.application.Standalone,

    members:
    {
      _windowManager: null,
      _personalInfoWindow: null,
      _contactInfoWindow: null,
      _academicInfoWindow: null,
      _studentInfoTableWindow: null,
      _statusLabel: null,
      _loginPage: null,
      _mainContainer: null,

      main() {
        this.base(arguments);

        const root = this.getRoot();
        
        // Create login page (visible initially)
        this._loginPage = new qooxdo_proj.pages.Login();
        root.add(this._loginPage, { edge: 0 });
        
        // Listen for successful login
        this._loginPage.addListener("loginSuccess", (e) => {
          const data = e.getData();
          this._handleLoginSuccess(data.username);
        }, this);
        
        // Create main container (hidden initially) - add it first so login page is on top
        this._mainContainer = new qx.ui.container.Composite();
        this._mainContainer.setLayout(new qx.ui.layout.Canvas());
        this._mainContainer.setVisibility("hidden");
        root.add(this._mainContainer, { edge: 0 });
        
        // Initialize main application (but it will be hidden until login)
        this._initializeMainApplication();
      },

      _initializeMainApplication() {
        const rootContainer = this._mainContainer;
        const root = this.getRoot();
        
        // Initialize Window Manager
        this._windowManager = new qooxdo_proj.components.WindowManager();
        this._windowManager.init(root);

        // Create Menu Bar component and pass window manager reference
        const menuBar = new qooxdo_proj.components.MenuBar();
        menuBar.setWindowManager(this._windowManager);
        rootContainer.add(menuBar, { left: 0, top: 0, right: 0 });

        // Create window components
        this._personalInfoWindow = new qooxdo_proj.components.Windows.PersonalInfoWindow();
        this._contactInfoWindow = new qooxdo_proj.components.Windows.ContactInfoWindow();
        this._academicInfoWindow = new qooxdo_proj.components.Windows.AcademicInfoWindow();
        this._studentInfoTableWindow = new qooxdo_proj.components.Windows.StudentInfoTableWindow();

        // Register windows with WindowManager (but don't open them yet - wait for login)
        this._windowManager.registerWindow(
          "personalInfo",
          this._personalInfoWindow,
          { left: 50, top: 80, open: false }
        );

        this._windowManager.registerWindow(
          "contactInfo",
          this._contactInfoWindow,
          { left: 680, top: 80, open: false }
        );

        this._windowManager.registerWindow(
          "academicInfo",
          this._academicInfoWindow,
          { left: 1310, top: 80, open: false }
        );

        this._windowManager.registerWindow(
          "studentTable",
          this._studentInfoTableWindow,
          { left: 50, top: 600, open: false, }
        );

        // Load students when table window is opened
        this._studentInfoTableWindow.addListener("appear", () => {
          this._studentInfoTableWindow.loadStudents();
        }, this);

        // Main container for buttons and status
        const mainContainer = new qx.ui.container.Composite();
        mainContainer.setLayout(new qx.ui.layout.VBox(10));
        mainContainer.setPadding(20);
        mainContainer.setBackgroundColor("white");
        mainContainer.setDecorator("main");

        // Header
        const header = new qx.ui.basic.Label("Student Registration System");
        header.setFont("bold");
        mainContainer.add(header);

        // Create Form Action Buttons component
        const formActionButtons = new qooxdo_proj.components.Buttons.FormActionButtons();

        // Create Counter Buttons component
        const counterButtons = new qooxdo_proj.components.Buttons.CounterButtons();

        // Button container
        const buttonContainer = new qx.ui.container.Composite();
        buttonContainer.setLayout(new qx.ui.layout.HBox(10));
        buttonContainer.add(formActionButtons);
        buttonContainer.add(counterButtons);
        mainContainer.add(buttonContainer);

        // Status
        this._statusLabel = new qx.ui.basic.Label("Ready");
        this._statusLabel.setRich(true);
        mainContainer.add(this._statusLabel);

        // Form Action Buttons event handlers
        formActionButtons.addListener("submit", () => {
          this._handleSubmit();
        });

        formActionButtons.addListener("cancel", () => {
          this._handleCancel();
        });

        // Counter Buttons event handlers
        counterButtons.addListener("pressMe", (e) => {
          const data = e.getData();
          this._statusLabel.setValue(data.message);
        });

        counterButtons.addListener("resetCounter", () => {
          this._statusLabel.setValue("Counter reset to 0");
        });

        mainContainer.setWidth(400);
        // Position the main container in the bottom right area to avoid overlapping with windows
        rootContainer.add(mainContainer, { right: 50, top: 80 });
        
        // Store reference to main container for later use
        this._buttonContainer = mainContainer;
      },

      _handleLoginSuccess(username) {
        // Hide login page
        this._loginPage.setVisibility("hidden");
        
        // Show main application
        this._mainContainer.setVisibility("visible");
        
        // Don't open windows automatically - let user open them via menu
        
        // Optional: Update status to show logged in user
        if (this._statusLabel) {
          this._statusLabel.setValue(`<span style='color: green;'>Welcome, ${username}!</span>`);
        }
      },

      _handleSubmit() {
        // Validate all forms
        const personalValidation = this._personalInfoWindow.validate();
        if (!personalValidation.valid) {
          this._statusLabel.setValue("<span style='color: red;'>Error: " + personalValidation.message + "</span>");
          // Open the personal info window if it's closed
          this._windowManager.openWindow("personalInfo");
          return;
        }

        const contactValidation = this._contactInfoWindow.validate();
        if (!contactValidation.valid) {
          this._statusLabel.setValue("<span style='color: red;'>Error: " + contactValidation.message + "</span>");
          // Open the contact info window if it's closed
          this._windowManager.openWindow("contactInfo");
          return;
        }

        const academicValidation = this._academicInfoWindow.validate();
        if (!academicValidation.valid) {
          this._statusLabel.setValue("<span style='color: red;'>Error: " + academicValidation.message + "</span>");
          // Open the academic info window if it's closed
          this._windowManager.openWindow("academicInfo");
          return;
        }

        // Get data from all forms
        const personalData = this._personalInfoWindow.getData();
        const contactData = this._contactInfoWindow.getData();
        const academicData = this._academicInfoWindow.getData();

        // Combine all data
        const studentData = {
          studentId: personalData.studentId,
          firstName: personalData.firstName,
          lastName: personalData.lastName,
          dateOfBirth: personalData.dateOfBirth ? personalData.dateOfBirth.toISOString() : null,
          gender: personalData.gender,
          address: personalData.address,
          email: contactData.email,
          personalPhone: contactData.personalPhone,
          emergencyContact: contactData.emergencyContact,
          emergencyContactPhone: contactData.emergencyContactPhone,
          relationship: contactData.relationship,
          program: academicData.program,
          yearLevel: academicData.yearLevel,
          gradeSchool: academicData.previousSchools.gradeSchool,
          highSchool: academicData.previousSchools.highSchool,
          college: academicData.previousSchools.college
        };

        // Send to API
        this._statusLabel.setValue("<span style='color: blue;'>Saving student...</span>");
        
        fetch("http://localhost:3000/api/students", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(studentData)
        })
        .then(response => {
          if (!response.ok) {
            return response.json().then(errorData => {
              throw new Error(errorData.error || `Server error: ${response.status}`);
            }).catch(() => {
              throw new Error(`Server error: ${response.status}`);
            });
          }
          return response.json();
        })
        .then(savedStudent => {
          // Add student to table
          this._studentInfoTableWindow.addStudent({
            studentId: savedStudent.studentId,
            firstName: savedStudent.firstName,
            lastName: savedStudent.lastName,
            program: savedStudent.program,
            yearLevel: savedStudent.yearLevel
          });

          this._statusLabel.setValue("<span style='color: green;'>Student registered successfully!</span>");
          this._windowManager.openWindow("studentTable");
          
          // Clear forms
          this._personalInfoWindow.clear();
          this._contactInfoWindow.clear();
          this._academicInfoWindow.clear();
        })
        .catch(error => {
          console.error("Save student error:", error);
          this._statusLabel.setValue("<span style='color: red;'>Error: " + error.message + "</span>");
        });
      },

      _handleCancel() {
        this._personalInfoWindow.clear();
        this._contactInfoWindow.clear();
        this._academicInfoWindow.clear();
        this._statusLabel.setValue("All form fields cleared");
      },

      // Public method to get window manager (for menu bar access)
      getWindowManager() {
        return this._windowManager;
      }
    }
  });
