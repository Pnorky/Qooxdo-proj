/* ************************************************************************

   Copyright: 2026 

   License: MIT license

   Authors: 

************************************************************************ */

qx.Class.define("qooxdo_proj.pages.AcademicInfoTab",
{
  extend : qx.ui.tabview.Page,

  construct : function()
  {
    this.base(arguments, "Academic Info");
    this.setLayout(new qx.ui.layout.VBox(10));
    this.setPadding(20);
    
    this._createForm();
  },

  members :
  {
    _programField : null,
    _yearLevelField : null,
    _gradeSchoolField : null,
    _highSchoolField : null,
    _collegeField : null,

    _createForm : function()
    {
      // Academic Info Grid
      const academicInfoGrid = new qx.ui.container.Composite();
      academicInfoGrid.setLayout(new qx.ui.layout.Grid(5, 5));

      // Academic Info Fields
      this._programField = new qx.ui.form.ComboBox();
      this._programField.add(new qx.ui.form.ListItem("Bachelor of Science in Computer Science"));
      this._programField.add(new qx.ui.form.ListItem("Bachelor of Science in Information Technology"));
      this._programField.add(new qx.ui.form.ListItem("Bachelor of Science in Information Systems"));
      this._programField.add(new qx.ui.form.ListItem("Bachelor of Science in Business Administration"));
      this._programField.add(new qx.ui.form.ListItem("Bachelor of Science in Accounting"));
      this._programField.add(new qx.ui.form.ListItem("Bachelor of Science in Marketing"));
      this._programField.add(new qx.ui.form.ListItem("Bachelor of Science in Management"));
      academicInfoGrid.add(new qx.ui.basic.Label("Program:"), { row: 0, column: 0 });
      academicInfoGrid.add(this._programField, { row: 0, column: 1 });

      this._yearLevelField = new qx.ui.form.ComboBox();
      this._yearLevelField.add(new qx.ui.form.ListItem("1"));
      this._yearLevelField.add(new qx.ui.form.ListItem("2"));
      this._yearLevelField.add(new qx.ui.form.ListItem("3"));
      this._yearLevelField.add(new qx.ui.form.ListItem("4"));
      academicInfoGrid.add(new qx.ui.basic.Label("Year Level:"), { row: 1, column: 0 });
      academicInfoGrid.add(this._yearLevelField, { row: 1, column: 1 });

      this.add(academicInfoGrid);

      // Previous School Attended Section - Table
      const previousSchoolLabel = new qx.ui.basic.Label("Previous School Attended:");
      previousSchoolLabel.setFont("bold");
      this.add(previousSchoolLabel);

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
      
      this._gradeSchoolField = new qx.ui.form.TextField();
      this._gradeSchoolField.setWidth(400);
      previousSchoolTable.add(this._gradeSchoolField, { row: 1, column: 1 });

      // High School Row
      const highSchoolLabel = new qx.ui.basic.Label("High School:");
      highSchoolLabel.setPadding(5);
      previousSchoolTable.add(highSchoolLabel, { row: 2, column: 0 });
      
      this._highSchoolField = new qx.ui.form.TextField();
      this._highSchoolField.setWidth(400);
      previousSchoolTable.add(this._highSchoolField, { row: 2, column: 1 });

      // College Row
      const collegeLabel = new qx.ui.basic.Label("College:");
      collegeLabel.setPadding(5);
      previousSchoolTable.add(collegeLabel, { row: 3, column: 0 });
      
      this._collegeField = new qx.ui.form.TextField();
      this._collegeField.setWidth(400);
      previousSchoolTable.add(this._collegeField, { row: 3, column: 1 });

      this.add(previousSchoolTable);
    },

     // Public methods to get form data
     getData : function()
     {
       // Get program value (handle ComboBox selection)
       let programValue = "";
       const programSelection = this._programField.getSelection();
       if (programSelection && programSelection.length > 0) {
         programValue = programSelection[0].getLabel();
       } else {
         programValue = this._programField.getValue() || "";
       }

       // Get year level value (handle ComboBox selection)
       let yearLevelValue = "";
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
     validate : function()
     {
       if (!this._programField.getValue() || !this._yearLevelField.getValue()) {
         return { valid: false, message: "Program and Year Level are required" };
       }
       return { valid: true };
     },

     // Clear form
     clear : function()
     {
       this._programField.setValue("");
       this._programField.setSelection([]);
       this._yearLevelField.setValue("");
       this._yearLevelField.setSelection([]);
       this._gradeSchoolField.setValue("");
       this._highSchoolField.setValue("");
       this._collegeField.setValue("");
     }
  }
});
