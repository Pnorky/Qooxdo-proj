qx.Class.define("qooxdo_proj.Application",
  {
    extend: qx.application.Standalone,

    members:
    {
      main() {
        super.main();

        const root = this.getRoot();
        const rootContainer = new qx.ui.container.Composite();
        rootContainer.setLayout(new qx.ui.layout.Canvas());

        const tabView = new qx.ui.tabview.TabView();
        tabView.setHeight(450);

        // Tab 1: Personal Info
        const personalInfoPage = new qx.ui.tabview.Page("Personal Info", "icons/16/apps/internet-web-browser.png");
        personalInfoPage.setLayout(new qx.ui.layout.VBox(10));
        personalInfoPage.setPadding(20);

        // Personal Info Grid
        const personalInfoGrid = new qx.ui.container.Composite();
        personalInfoGrid.setLayout(new qx.ui.layout.Grid(5, 5));

        // Personal Info Fields
        const studentIdField = new qx.ui.form.TextField();
        personalInfoGrid.add(new qx.ui.basic.Label("Student ID:"), { row: 0, column: 0 });
        personalInfoGrid.add(studentIdField, { row: 0, column: 1 });

        const firstNameField = new qx.ui.form.TextField();
        personalInfoGrid.add(new qx.ui.basic.Label("First Name:"), { row: 1, column: 0 });
        personalInfoGrid.add(firstNameField, { row: 1, column: 1 });

        const lastNameField = new qx.ui.form.TextField();
        personalInfoGrid.add(new qx.ui.basic.Label("Last Name:"), { row: 2, column: 0 });
        personalInfoGrid.add(lastNameField, { row: 2, column: 1 });

        const dobField = new qx.ui.form.DateField();
        personalInfoGrid.add(new qx.ui.basic.Label("Date of Birth:"), { row: 3, column: 0 });
        personalInfoGrid.add(dobField, { row: 3, column: 1 });

        const genderField = new qx.ui.form.ComboBox();
        genderField.add(new qx.ui.form.ListItem("Male"));
        genderField.add(new qx.ui.form.ListItem("Female"));
        personalInfoGrid.add(new qx.ui.basic.Label("Gender:"), { row: 4, column: 0 });
        personalInfoGrid.add(genderField, { row: 4, column: 1 });
        
        const addressField = new qx.ui.form.TextArea();
        personalInfoGrid.add(new qx.ui.basic.Label("Address:"), { row: 5, column: 0 });
        personalInfoGrid.add(addressField, { row: 5, column: 1 });

        personalInfoPage.add(personalInfoGrid, { flex: 1 });

        // Personal Info Tab Buttons
        const personalInfoButtonContainer = new qx.ui.container.Composite();
        personalInfoButtonContainer.setLayout(new qx.ui.layout.HBox(10));
        
        const personalInfoSubmitButton = new qx.ui.form.Button("Submit");
        const personalInfoCancelButton = new qx.ui.form.Button("Cancel");
        
        personalInfoButtonContainer.add(personalInfoSubmitButton);
        personalInfoButtonContainer.add(personalInfoCancelButton);
        personalInfoPage.add(personalInfoButtonContainer);

        tabView.add(personalInfoPage);

        // Contact Info Tab
        const contactInfoPage = new qx.ui.tabview.Page("Contact Info");
        contactInfoPage.setLayout(new qx.ui.layout.VBox(10));
        contactInfoPage.setPadding(20);

        // Contact Info Grid
        const contactInfoGrid = new qx.ui.container.Composite();
        contactInfoGrid.setLayout(new qx.ui.layout.Grid(5, 5));

        // Contact Info Fields
        const emailField = new qx.ui.form.TextField();
        contactInfoGrid.add(new qx.ui.basic.Label("Email:"), { row: 0, column: 0 });
        contactInfoGrid.add(emailField, { row: 0, column: 1 });

        const personalPhoneField = new qx.ui.form.TextField();
        contactInfoGrid.add(new qx.ui.basic.Label("Personal Phone:"), { row: 1, column: 0 });
        contactInfoGrid.add(personalPhoneField, { row: 1, column: 1 });

        const emergencyContactField = new qx.ui.form.TextField();
        contactInfoGrid.add(new qx.ui.basic.Label("Emergency Contact:"), { row: 2, column: 0 });
        contactInfoGrid.add(emergencyContactField, { row: 2, column: 1 });

        const emergencyContactPhoneField = new qx.ui.form.TextField();
        contactInfoGrid.add(new qx.ui.basic.Label("Emergency Contact Phone:"), { row: 3, column: 0 });
        contactInfoGrid.add(emergencyContactPhoneField, { row: 3, column: 1 });

        const relationshipField = new qx.ui.form.TextField();
        contactInfoGrid.add(new qx.ui.basic.Label("Relationship:"), { row: 4, column: 0 });
        contactInfoGrid.add(relationshipField, { row: 4, column: 1 });

        contactInfoPage.add(contactInfoGrid, { flex: 1 });

        // Contact Info Tab Buttons
        const contactInfoButtonContainer = new qx.ui.container.Composite();
        contactInfoButtonContainer.setLayout(new qx.ui.layout.HBox(10));
        
        const contactInfoSubmitButton = new qx.ui.form.Button("Submit");
        const contactInfoCancelButton = new qx.ui.form.Button("Cancel");
        
        contactInfoButtonContainer.add(contactInfoSubmitButton);
        contactInfoButtonContainer.add(contactInfoCancelButton);
        contactInfoPage.add(contactInfoButtonContainer);

        tabView.add(contactInfoPage);

        // Academic Info Tab
        const academicInfoPage = new qx.ui.tabview.Page("Academic Info");
        academicInfoPage.setLayout(new qx.ui.layout.VBox(10));
        academicInfoPage.setPadding(20);

        // Academic Info Grid
        const academicInfoGrid = new qx.ui.container.Composite();
        academicInfoGrid.setLayout(new qx.ui.layout.Grid(5, 5));

        // Academic Info Fields
        const programField = new qx.ui.form.ComboBox();
        programField.add(new qx.ui.form.ListItem("Bachelor of Science in Computer Science"));
        programField.add(new qx.ui.form.ListItem("Bachelor of Science in Information Technology"));
        programField.add(new qx.ui.form.ListItem("Bachelor of Science in Information Systems"));
        programField.add(new qx.ui.form.ListItem("Bachelor of Science in Business Administration"));
        programField.add(new qx.ui.form.ListItem("Bachelor of Science in Accounting"));
        programField.add(new qx.ui.form.ListItem("Bachelor of Science in Marketing"));
        programField.add(new qx.ui.form.ListItem("Bachelor of Science in Management"));
        academicInfoGrid.add(new qx.ui.basic.Label("Program:"), { row: 0, column: 0 });
        academicInfoGrid.add(programField, { row: 0, column: 1 });

        const yearLevelField = new qx.ui.form.TextField();
        academicInfoGrid.add(new qx.ui.basic.Label("Year Level:"), { row: 1, column: 0 });
        academicInfoGrid.add(yearLevelField, { row: 1, column: 1 });

        academicInfoPage.add(academicInfoGrid);

        // Previous School Attended Section - Table
        const previousSchoolLabel = new qx.ui.basic.Label("Previous School Attended:");
        previousSchoolLabel.setFont("bold");
        academicInfoPage.add(previousSchoolLabel);

        // Create table-like structure using Grid layout
        const previousSchoolTable = new qx.ui.container.Composite();
        previousSchoolTable.setLayout(new qx.ui.layout.Grid(2, 2));
        previousSchoolTable.setDecorator("main");
        previousSchoolTable.setPadding(5);

        // Table Header Row
        const headerType = new qx.ui.basic.Label("School Type");
        headerType.setFont("bold");
        headerType.setPadding(5);
        previousSchoolTable.add(headerType, { row: 0, column: 0 });

        const headerName = new qx.ui.basic.Label("School Name");
        headerName.setFont("bold");
        headerName.setPadding(5);
        previousSchoolTable.add(headerName, { row: 0, column: 1 });

        // Grade School Row
        const gradeSchoolLabel = new qx.ui.basic.Label("Grade School:");
        gradeSchoolLabel.setPadding(5);
        previousSchoolTable.add(gradeSchoolLabel, { row: 1, column: 0 });
        
        const gradeSchoolField = new qx.ui.form.TextField();
        gradeSchoolField.setWidth(400);
        previousSchoolTable.add(gradeSchoolField, { row: 1, column: 1 });

        // High School Row
        const highSchoolLabel = new qx.ui.basic.Label("High School:");
        highSchoolLabel.setPadding(5);
        previousSchoolTable.add(highSchoolLabel, { row: 2, column: 0 });
        
        const highSchoolField = new qx.ui.form.TextField();
        highSchoolField.setWidth(400);
        previousSchoolTable.add(highSchoolField, { row: 2, column: 1 });

        // College Row
        const collegeLabel = new qx.ui.basic.Label("College:");
        collegeLabel.setPadding(5);
        previousSchoolTable.add(collegeLabel, { row: 3, column: 0 });
        
        const collegeField = new qx.ui.form.TextField();
        collegeField.setWidth(400);
        previousSchoolTable.add(collegeField, { row: 3, column: 1 });

        academicInfoPage.add(previousSchoolTable);

        // Academic Info Tab Buttons
        const academicInfoButtonContainer = new qx.ui.container.Composite();
        academicInfoButtonContainer.setLayout(new qx.ui.layout.HBox(10));
        
        const academicInfoSubmitButton = new qx.ui.form.Button("Submit");
        const academicInfoCancelButton = new qx.ui.form.Button("Cancel");
        
        academicInfoButtonContainer.add(academicInfoSubmitButton);
        academicInfoButtonContainer.add(academicInfoCancelButton);
        academicInfoPage.add(academicInfoButtonContainer);

        tabView.add(academicInfoPage);

        // Main container for tabView, buttons, and status
        const mainContainer = new qx.ui.container.Composite();
        mainContainer.setLayout(new qx.ui.layout.VBox(10));
        mainContainer.setPadding(20);

        // Header
        const header = new qx.ui.basic.Label("Student Registration Form");
        header.setFont("bold");
        mainContainer.add(header);

        // Add tabView
        mainContainer.add(tabView, { flex: 1 });

        // Buttons
        const buttonContainer = new qx.ui.container.Composite();
        buttonContainer.setLayout(new qx.ui.layout.HBox(10));

        const pressMeButton = new qx.ui.form.Button("Press Me");
        const resetCounterButton = new qx.ui.form.Button("Reset Counter");

        buttonContainer.add(pressMeButton);
        buttonContainer.add(resetCounterButton);
        mainContainer.add(buttonContainer);

        // Status
        const statusLabel = new qx.ui.basic.Label("");
        mainContainer.add(statusLabel);

        // Counter for Press Me button
        let clickCount = 0;

        // Tab-specific button event handlers
        // Personal Info Tab Submit
        personalInfoSubmitButton.addListener("execute", () => {
          if (!studentIdField.getValue() || !firstNameField.getValue() || !lastNameField.getValue()) {
            statusLabel.setValue("Error: Please fill required Personal Info fields");
            return;
          }
          statusLabel.setValue("Personal Info saved successfully");
          console.log("Personal Info:", {
            studentId: studentIdField.getValue(),
            firstName: firstNameField.getValue(),
            lastName: lastNameField.getValue(),
            dateOfBirth: dobField.getValue()
          });
        });

        // Personal Info Tab Cancel
        personalInfoCancelButton.addListener("execute", () => {
          studentIdField.setValue("");
          firstNameField.setValue("");
          lastNameField.setValue("");
          dobField.setValue(null);
          statusLabel.setValue("Personal Info cleared");
        });

        // Contact Info Tab Submit
        contactInfoSubmitButton.addListener("execute", () => {
          if (!emailField.getValue()) {
            statusLabel.setValue("Error: Email is required");
            return;
          }
          statusLabel.setValue("Contact Info saved successfully");
          console.log("Contact Info:", {
            email: emailField.getValue(),
            personalPhone: personalPhoneField.getValue(),
            emergencyContact: emergencyContactField.getValue(),
            emergencyContactPhone: emergencyContactPhoneField.getValue(),
            relationship: relationshipField.getValue()
          });
        });

        // Contact Info Tab Cancel
        contactInfoCancelButton.addListener("execute", () => {
          emailField.setValue("");
          personalPhoneField.setValue("");
          emergencyContactField.setValue("");
          emergencyContactPhoneField.setValue("");
          relationshipField.setValue("");
          statusLabel.setValue("Contact Info cleared");
        });

        // Academic Info Tab Submit
        academicInfoSubmitButton.addListener("execute", () => {
          if (!programField.getValue() || !yearLevelField.getValue()) {
            statusLabel.setValue("Error: Program and Year Level are required");
            return;
          }
          statusLabel.setValue("Academic Info saved successfully");
          
          console.log("Academic Info:", {
            program: programField.getValue(),
            yearLevel: yearLevelField.getValue(),
            previousSchools: {
              gradeSchool: gradeSchoolField.getValue() || "",
              highSchool: highSchoolField.getValue() || "",
              college: collegeField.getValue() || ""
            }
          });
        });

        // Academic Info Tab Cancel
        academicInfoCancelButton.addListener("execute", () => {
          programField.setValue("");
          yearLevelField.setValue("");
          gradeSchoolField.setValue("");
          highSchoolField.setValue("");
          collegeField.setValue("");
          statusLabel.setValue("Academic Info cleared");
        });

        pressMeButton.addListener("execute", () => {
          clickCount++;
          statusLabel.setValue(`Button clicked ${clickCount} time${clickCount !== 1 ? 's' : ''}`);
        });

        resetCounterButton.addListener("execute", () => {
          clickCount = 0;
          statusLabel.setValue("Counter reset to 0");
        });

        rootContainer.add(mainContainer, { left: 50, top: 50 });
        root.add(rootContainer);
      }
    }
  });
