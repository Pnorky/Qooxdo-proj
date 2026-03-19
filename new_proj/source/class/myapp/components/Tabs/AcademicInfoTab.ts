/* ************************************************************************

   Copyright: 2026 

   License: MIT license

   Authors: 

************************************************************************ */

type AcademicData = {
  program: string;
  yearLevel: string;
  previousSchools: {
    gradeSchool: string;
    highSchool: string;
    college: string;
  };
};
declare var myapp: any;

type ValidationResult = {
  valid: boolean;
  message?: string;
};

qx.Class.define("myapp.components.Tabs.AcademicInfoTab", {
  extend: qx.ui.tabview.Page,

  construct: function () {
    (this as any).base(arguments, "Academic Info");
    this.setLayout(new qx.ui.layout.VBox(10));
    this.setPadding(20);
    
    this._createForm();
  },

  members: {
    _programField: null as any,
    _yearLevelField: null as any,
    _gradeSchoolField: null as any,
    _highSchoolField: null as any,
    _collegeField: null as any,

    _createForm: function (): void {
      // Academic Info Grid
      const academicInfoGrid = new qx.ui.container.Composite();
      const academicGridLayout = new qx.ui.layout.Grid(5, 5);
      academicGridLayout.setColumnFlex(1, 1);
      academicGridLayout.setColumnMinWidth(1, 180);
      academicInfoGrid.setLayout(academicGridLayout);

      // Academic Info Fields
      this._programField = new myapp.components.ui.ComboBox();
      this._programField.add("Bachelor of Science in Computer Science");
      this._programField.add("Bachelor of Science in Information Technology");
      this._programField.add("Bachelor of Science in Information Systems");
      this._programField.add("Bachelor of Science in Business Administration");
      this._programField.add("Bachelor of Science in Accounting");
      this._programField.add("Bachelor of Science in Marketing");
      this._programField.add("Bachelor of Science in Management");
      
      // Wrap Program label and field in containers with matching height
      const programLabelContainer = new qx.ui.container.Composite();
      programLabelContainer.setLayout(new qx.ui.layout.HBox());
      programLabelContainer.setHeight(41); // Match combobox height
      programLabelContainer.setMarginTop(-5); // Move label higher
      const programLabel = new myapp.components.ui.Label("Program:");
      programLabelContainer.add(programLabel, { flex: 0 });
      this._programField.setMinWidth(0);
      this._programField.setMaxWidth(720);
      
      const programFieldContainer = new qx.ui.container.Composite();
      programFieldContainer.setLayout(new qx.ui.layout.HBox());
      programFieldContainer.setHeight(41); // Match combobox height
      programFieldContainer.add(this._programField, { flex: 1 });
      
      academicInfoGrid.add(programLabelContainer, { row: 0, column: 0 });
      academicInfoGrid.add(programFieldContainer, { row: 0, column: 1 });

      this._yearLevelField = new myapp.components.ui.ComboBox();
      this._yearLevelField.add("1");
      this._yearLevelField.add("2");
      this._yearLevelField.add("3");
      this._yearLevelField.add("4");
      
      // Wrap Year Level label and field in containers with matching height
      const yearLevelLabelContainer = new qx.ui.container.Composite();
      yearLevelLabelContainer.setLayout(new qx.ui.layout.HBox());
      yearLevelLabelContainer.setHeight(41); // Match combobox height
      yearLevelLabelContainer.setMarginTop(-5); // Move label higher
      const yearLevelLabel = new myapp.components.ui.Label("Year Level:");
      yearLevelLabelContainer.add(yearLevelLabel, { flex: 0 });
      
      const yearLevelFieldContainer = new qx.ui.container.Composite();
      yearLevelFieldContainer.setLayout(new qx.ui.layout.HBox());
      yearLevelFieldContainer.setHeight(41); // Match combobox height
      yearLevelFieldContainer.add(this._yearLevelField, { flex: 1 });
      
      academicInfoGrid.add(yearLevelLabelContainer, { row: 1, column: 0 });
      academicInfoGrid.add(yearLevelFieldContainer, { row: 1, column: 1 });
      this._yearLevelField.setWidth(140);
      this._yearLevelField.setMinWidth(100);
      this._yearLevelField.setMaxWidth(180);

      this.add(academicInfoGrid, { flex: 1 });

      // Previous School Attended Section - Table
      const previousSchoolLabel = new myapp.components.ui.Label("Previous School Attended:");
      previousSchoolLabel.setFont("bold");
      this.add(previousSchoolLabel);

      // Create table-like structure using Grid layout
      const previousSchoolTable = new qx.ui.container.Composite();
      const previousSchoolGrid = new qx.ui.layout.Grid(2, 2);
      previousSchoolGrid.setColumnFlex(1, 1);
      previousSchoolGrid.setColumnMinWidth(1, 180);
      previousSchoolTable.setLayout(previousSchoolGrid);
      previousSchoolTable.setDecorator("main");
      previousSchoolTable.setPadding(5);

      // Table Header Row
      const headerType = new myapp.components.ui.Label("School Type");
      headerType.setFont("bold");
      headerType.setPadding(5);
      previousSchoolTable.add(headerType, { row: 0, column: 0 });

      const headerName = new myapp.components.ui.Label("School Name");
      headerName.setFont("bold");
      headerName.setPadding(5);
      previousSchoolTable.add(headerName, { row: 0, column: 1 });

      // Grade School Row
      const gradeSchoolLabel = new myapp.components.ui.Label("Grade School:");
      gradeSchoolLabel.setPadding(5);
      previousSchoolTable.add(gradeSchoolLabel, { row: 1, column: 0 });
      
      this._gradeSchoolField = new myapp.components.ui.TextField();
      this._gradeSchoolField.setMinWidth(0);
      this._gradeSchoolField.setMaxWidth(720);
      previousSchoolTable.add(this._gradeSchoolField, { row: 1, column: 1 });

      // High School Row
      const highSchoolLabel = new myapp.components.ui.Label("High School:");
      highSchoolLabel.setPadding(5);
      previousSchoolTable.add(highSchoolLabel, { row: 2, column: 0 });
      
      this._highSchoolField = new myapp.components.ui.TextField();
      this._highSchoolField.setMinWidth(0);
      this._highSchoolField.setMaxWidth(720);
      previousSchoolTable.add(this._highSchoolField, { row: 2, column: 1 });

      // College Row
      const collegeLabel = new myapp.components.ui.Label("College:");
      collegeLabel.setPadding(5);
      previousSchoolTable.add(collegeLabel, { row: 3, column: 0 });
      
      this._collegeField = new myapp.components.ui.TextField();
      this._collegeField.setMinWidth(0);
      this._collegeField.setMaxWidth(720);
      previousSchoolTable.add(this._collegeField, { row: 3, column: 1 });

      this.add(previousSchoolTable, { flex: 1 });
    },

     // Public methods to get form data
     getData: function (): AcademicData {
       // Get program value (handle ComboBox selection)
       let programValue: string = "";
       const programSelection = this._programField.getSelection();
       if (programSelection && programSelection.length > 0) {
         programValue = programSelection[0].getLabel();
       } else {
         programValue = this._programField.getValue() || "";
       }

       // Get year level value (handle ComboBox selection)
       let yearLevelValue: string = "";
       const yearLevelSelection = this._yearLevelField.getSelection();
       if (yearLevelSelection && yearLevelSelection.length > 0) {
         yearLevelValue = yearLevelSelection[0].getLabel();
       } else {
         yearLevelValue = this._yearLevelField.getValue() || "";
       }

       return {
         program: programValue,
         yearLevel: yearLevelValue,
         previousSchools: {
           gradeSchool: this._gradeSchoolField.getValue() || "",
           highSchool: this._highSchoolField.getValue() || "",
           college: this._collegeField.getValue() || ""
         }
       };
     },

     // Validate form
     validate: function (): ValidationResult {
       if (!this._programField.getValue() || !this._yearLevelField.getValue()) {
         return { valid: false, message: "Program and Year Level are required" };
       }
       return { valid: true };
     },

    // Clear form
    clear: function (): void {
      this._programField.setValue("");
      this._programField.resetSelection();
      this._yearLevelField.setValue("");
      this._yearLevelField.resetSelection();
      this._gradeSchoolField.setValue("");
      this._highSchoolField.setValue("");
      this._collegeField.setValue("");
    }
  }
});

