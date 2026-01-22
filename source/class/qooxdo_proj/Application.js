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
        root.add(rootContainer, { edge: 0 });

        // Create menu bar commands
        this.createCommands();

        // Add menu bar
        const menuBar = this.getMenuBar();
        rootContainer.add(menuBar, { left: 0, top: 0, right: 0 });

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

        rootContainer.add(mainContainer, { left: 50, top: 80 });
      },

      debugRadio(e) {
        this.debug("Change selection: " + e.getData()[0].getLabel());
      },

      debugCommand(e) {
        this.debug("Execute command: " + this.getShortcut());
      },

      debugButton(e) {
        this.debug("Execute button: " + this.getLabel());
      },

      debugCheckBox(e) {
        this.debug("Change checked: " + this.getLabel() + " = " + e.getData());
      },

      createCommands() {
        this._newCommand = new qx.ui.command.Command("Ctrl+N");
        this._newCommand.addListener("execute", this.debugCommand, this);

        this._openCommand = new qx.ui.command.Command("Ctrl+O");
        this._openCommand.addListener("execute", this.debugCommand, this);

        this._saveCommand = new qx.ui.command.Command("Ctrl+S");
        this._saveCommand.addListener("execute", this.debugCommand, this);

        this._undoCommand = new qx.ui.command.Command("Ctrl+Z");
        this._undoCommand.addListener("execute", this.debugCommand, this);

        this._redoCommand = new qx.ui.command.Command("Ctrl+R");
        this._redoCommand.addListener("execute", this.debugCommand, this);

        this._cutCommand = new qx.ui.command.Command("Ctrl+X");
        this._cutCommand.addListener("execute", this.debugCommand, this);

        this._copyCommand = new qx.ui.command.Command("Ctrl+C");
        this._copyCommand.addListener("execute", this.debugCommand, this);

        this._pasteCommand = new qx.ui.command.Command("Ctrl+P");
        this._pasteCommand.addListener("execute", this.debugCommand, this);

        this._pasteCommand.setEnabled(false);
      },

      getMenuBar() {
        var frame = new qx.ui.container.Composite(new qx.ui.layout.Grow());
        frame.setAllowStretchX(true);

        var menubar = new qx.ui.menubar.MenuBar();
        menubar.setAllowGrowX(true);
        frame.add(menubar);

        var fileMenu = new qx.ui.menubar.Button("File", null, this.getFileMenu());
        var studentMenu = new qx.ui.menubar.Button("Student", null, this.getStudentMenu());
        var reportsMenu = new qx.ui.menubar.Button("Reports", null, this.getReportsMenu());
        var toolsMenu = new qx.ui.menubar.Button("Tools", null, this.getToolsMenu());
        var viewMenu = new qx.ui.menubar.Button("View", null, this.getViewMenu());
        var helpMenu = new qx.ui.menubar.Button("Help", null, this.getHelpMenu());

        menubar.add(fileMenu);
        menubar.add(studentMenu);
        menubar.add(reportsMenu);
        menubar.add(toolsMenu);
        menubar.add(viewMenu);
        menubar.add(helpMenu);

        return frame;
      },

      getFileMenu() {
        var menu = new qx.ui.menu.Menu();

        var newStudentButton = new qx.ui.menu.Button(
          "New Student",
          "icon/16/actions/document-new.png",
          this._newCommand
        );
        var openRecordButton = new qx.ui.menu.Button(
          "Open Student Record",
          "icon/16/actions/document-open.png",
          this._openCommand
        );
        var saveButton = new qx.ui.menu.Button(
          "Save Student",
          "icon/16/actions/document-save.png",
          this._saveCommand
        );
        var exportButton = new qx.ui.menu.Button(
          "Export Data",
          "icon/16/actions/document-save-as.png"
        );
        var importButton = new qx.ui.menu.Button(
          "Import Data",
          "icon/16/actions/document-open.png"
        );
        var printButton = new qx.ui.menu.Button(
          "Print Student List",
          "icon/16/actions/document-print.png"
        );
        menu.addSeparator();
        var exitButton = new qx.ui.menu.Button(
          "Exit",
          "icon/16/actions/application-exit.png"
        );

        newStudentButton.addListener("execute", this.debugButton, this);
        openRecordButton.addListener("execute", this.debugButton, this);
        saveButton.addListener("execute", this.debugButton, this);
        exportButton.addListener("execute", this.debugButton, this);
        importButton.addListener("execute", this.debugButton, this);
        printButton.addListener("execute", this.debugButton, this);
        exitButton.addListener("execute", this.debugButton, this);

        menu.add(newStudentButton);
        menu.add(openRecordButton);
        menu.add(saveButton);
        menu.addSeparator();
        menu.add(exportButton);
        menu.add(importButton);
        menu.add(printButton);
        menu.addSeparator();
        menu.add(exitButton);

        return menu;
      },

      getStudentMenu() {
        var menu = new qx.ui.menu.Menu();

        var addStudentButton = new qx.ui.menu.Button(
          "Add New Student",
          "icon/16/actions/list-add.png"
        );
        var editStudentButton = new qx.ui.menu.Button(
          "Edit Student",
          "icon/16/actions/edit.png"
        );
        var deleteStudentButton = new qx.ui.menu.Button(
          "Delete Student",
          "icon/16/actions/edit-delete.png"
        );
        menu.addSeparator();
        var viewStudentListButton = new qx.ui.menu.Button(
          "View Student List",
          "icon/16/apps/utilities-system-monitor.png"
        );
        var clearFormButton = new qx.ui.menu.Button(
          "Clear Form",
          "icon/16/actions/edit-clear.png"
        );

        addStudentButton.addListener("execute", this.debugButton, this);
        editStudentButton.addListener("execute", this.debugButton, this);
        deleteStudentButton.addListener("execute", this.debugButton, this);
        viewStudentListButton.addListener("execute", this.debugButton, this);
        clearFormButton.addListener("execute", this.debugButton, this);

        menu.add(addStudentButton);
        menu.add(editStudentButton);
        menu.add(deleteStudentButton);
        menu.addSeparator();
        menu.add(viewStudentListButton);
        menu.add(clearFormButton);

        return menu;
      },

      getReportsMenu() {
        var menu = new qx.ui.menu.Menu();

        var studentListReportButton = new qx.ui.menu.Button(
          "Student List Report",
          "icon/16/apps/utilities-system-monitor.png"
        );
        var academicReportButton = new qx.ui.menu.Button(
          "Academic Report",
          "icon/16/actions/document-properties.png"
        );
        var enrollmentReportButton = new qx.ui.menu.Button(
          "Enrollment Statistics",
          "icon/16/apps/utilities-system-monitor.png"
        );
        var programReportButton = new qx.ui.menu.Button(
          "Program Distribution",
          "icon/16/actions/document-properties.png"
        );
        menu.addSeparator();
        var exportReportButton = new qx.ui.menu.Button(
          "Export Report",
          "icon/16/actions/document-save-as.png"
        );
        var printReportButton = new qx.ui.menu.Button(
          "Print Report",
          "icon/16/actions/document-print.png"
        );

        studentListReportButton.addListener("execute", this.debugButton, this);
        academicReportButton.addListener("execute", this.debugButton, this);
        enrollmentReportButton.addListener("execute", this.debugButton, this);
        programReportButton.addListener("execute", this.debugButton, this);
        exportReportButton.addListener("execute", this.debugButton, this);
        printReportButton.addListener("execute", this.debugButton, this);

        menu.add(studentListReportButton);
        menu.add(academicReportButton);
        menu.add(enrollmentReportButton);
        menu.add(programReportButton);
        menu.addSeparator();
        menu.add(exportReportButton);
        menu.add(printReportButton);

        return menu;
      },

      getViewMenu() {
        var menu = new qx.ui.menu.Menu();

        var showPersonalInfoCheckbox = new qx.ui.menu.CheckBox("Show Personal Info Tab");
        var showContactInfoCheckbox = new qx.ui.menu.CheckBox("Show Contact Info Tab");
        var showAcademicInfoCheckbox = new qx.ui.menu.CheckBox("Show Academic Info Tab");
        var showStudentTableCheckbox = new qx.ui.menu.CheckBox("Show Student Table");
        menu.addSeparator();
        var refreshButton = new qx.ui.menu.Button(
          "Refresh",
          "icon/16/actions/view-refresh.png"
        );
        var fullScreenButton = new qx.ui.menu.Button("Full Screen");

        showPersonalInfoCheckbox.setValue(true);
        showContactInfoCheckbox.setValue(true);
        showAcademicInfoCheckbox.setValue(true);
        showStudentTableCheckbox.setValue(true);

        showPersonalInfoCheckbox.addListener("changeValue", this.debugCheckBox, this);
        showContactInfoCheckbox.addListener("changeValue", this.debugCheckBox, this);
        showAcademicInfoCheckbox.addListener("changeValue", this.debugCheckBox, this);
        showStudentTableCheckbox.addListener("changeValue", this.debugCheckBox, this);
        refreshButton.addListener("execute", this.debugButton, this);
        fullScreenButton.addListener("execute", this.debugButton, this);

        menu.add(showPersonalInfoCheckbox);
        menu.add(showContactInfoCheckbox);
        menu.add(showAcademicInfoCheckbox);
        menu.add(showStudentTableCheckbox);
        menu.addSeparator();
        menu.add(refreshButton);
        menu.add(fullScreenButton);

        return menu;
      },

      getToolsMenu() {
        var menu = new qx.ui.menu.Menu();

        var searchStudentButton = new qx.ui.menu.Button(
          "Search Student",
          "icon/16/actions/system-search.png"
        );
        var filterStudentsButton = new qx.ui.menu.Button(
          "Filter Students",
          "icon/16/actions/view-filter.png"
        );
        var sortStudentsButton = new qx.ui.menu.Button(
          "Sort Students",
          "icon/16/actions/view-sort-ascending.png"
        );
        var validateDataButton = new qx.ui.menu.Button(
          "Validate Data",
          "icon/16/actions/dialog-ok-apply.png"
        );
        var backupDataButton = new qx.ui.menu.Button(
          "Backup Data",
          "icon/16/actions/document-save.png"
        );
        var restoreDataButton = new qx.ui.menu.Button(
          "Restore Data",
          "icon/16/actions/document-open.png"
        );
        menu.addSeparator();
        var settingsButton = new qx.ui.menu.Button(
          "Settings",
          "icon/16/apps/preferences-system.png"
        );

        searchStudentButton.addListener("execute", this.debugButton, this);
        filterStudentsButton.addListener("execute", this.debugButton, this);
        sortStudentsButton.addListener("execute", this.debugButton, this);
        validateDataButton.addListener("execute", this.debugButton, this);
        backupDataButton.addListener("execute", this.debugButton, this);
        restoreDataButton.addListener("execute", this.debugButton, this);
        settingsButton.addListener("execute", this.debugButton, this);

        menu.add(searchStudentButton);
        menu.add(filterStudentsButton);
        menu.add(sortStudentsButton);
        menu.addSeparator();
        menu.add(validateDataButton);
        menu.add(backupDataButton);
        menu.add(restoreDataButton);
        menu.addSeparator();
        menu.add(settingsButton);

        return menu;
      },

      getHelpMenu() {
        var menu = new qx.ui.menu.Menu();

        var userGuideButton = new qx.ui.menu.Button(
          "User Guide",
          "icon/16/apps/utilities-help.png"
        );
        var quickStartButton = new qx.ui.menu.Button("Quick Start");
        var keyboardShortcutsButton = new qx.ui.menu.Button("Keyboard Shortcuts");
        menu.addSeparator();
        var aboutButton = new qx.ui.menu.Button(
          "About Student Registration System",
          "icon/16/apps/utilities-help.png"
        );

        userGuideButton.addListener("execute", this.debugButton, this);
        quickStartButton.addListener("execute", this.debugButton, this);
        keyboardShortcutsButton.addListener("execute", this.debugButton, this);
        aboutButton.addListener("execute", this.debugButton, this);

        menu.add(userGuideButton);
        menu.add(quickStartButton);
        menu.add(keyboardShortcutsButton);
        menu.addSeparator();
        menu.add(aboutButton);

        return menu;
      }
    },

    /*
     *****************************************************************************
        DESTRUCT
     *****************************************************************************
     */

    destruct() {
      this._disposeObjects(
        "_newCommand",
        "_openCommand",
        "_saveCommand",
        "_undoCommand",
        "_redoCommand",
        "_cutCommand",
        "_copyCommand",
        "_pasteCommand"
      );
    }
  });
