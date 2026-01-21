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

        // Create component instances
        const personalInfoTab = new qooxdo_proj.pages.PersonalInfoTab();
        const contactInfoTab = new qooxdo_proj.pages.ContactInfoTab();
        const academicInfoTab = new qooxdo_proj.pages.AcademicInfoTab();
        const studentInfoTable = new qooxdo_proj.pages.StudentInfoTable();

        // Add tabs to TabView
        tabView.add(personalInfoTab);
        tabView.add(contactInfoTab);
        tabView.add(academicInfoTab);
        tabView.add(studentInfoTable);

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

        // Create Form Action Buttons component
        const formActionButtons = new qooxdo_proj.components.FormActionButtons();

        // Create Counter Buttons component
        const counterButtons = new qooxdo_proj.components.CounterButtons();

        // Button container
        const buttonContainer = new qx.ui.container.Composite();
        buttonContainer.setLayout(new qx.ui.layout.HBox(10));
        buttonContainer.add(formActionButtons);
        buttonContainer.add(counterButtons);
        mainContainer.add(buttonContainer);

        // Status
        const statusLabel = new qx.ui.basic.Label("");
        mainContainer.add(statusLabel);

        // Form Action Buttons event handlers
        formActionButtons.addListener("submit", () => {
          // Validate all tabs
          const personalValidation = personalInfoTab.validate();
          if (!personalValidation.valid) {
            statusLabel.setValue("Error: " + personalValidation.message);
            return;
          }

          const contactValidation = contactInfoTab.validate();
          if (!contactValidation.valid) {
            statusLabel.setValue("Error: " + contactValidation.message);
            return;
          }

          const academicValidation = academicInfoTab.validate();
          if (!academicValidation.valid) {
            statusLabel.setValue("Error: " + academicValidation.message);
            return;
          }

          // Get data from all tabs
          const personalData = personalInfoTab.getData();
          const contactData = contactInfoTab.getData();
          const academicData = academicInfoTab.getData();

          // Add student to table
          studentInfoTable.addStudent({
            studentId: personalData.studentId,
            firstName: personalData.firstName,
            lastName: personalData.lastName,
            program: academicData.program,
            yearLevel: academicData.yearLevel
          });

          statusLabel.setValue("Student registered successfully and added to table!");

          console.log("Complete Student Data:", {
            personalInfo: personalData,
            contactInfo: contactData,
            academicInfo: academicData
          });
        });

        formActionButtons.addListener("cancel", () => {
          personalInfoTab.clear();
          contactInfoTab.clear();
          academicInfoTab.clear();
          statusLabel.setValue("All form fields cleared");
        });

        // Counter Buttons event handlers
        counterButtons.addListener("pressMe", (e) => {
          const data = e.getData();
          statusLabel.setValue(data.message);
        });

        counterButtons.addListener("resetCounter", () => {
          statusLabel.setValue("Counter reset to 0");
        });

        rootContainer.add(mainContainer, { left: 50, top: 50 });
        root.add(rootContainer);
      }
    }
  });
