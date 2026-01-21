/* ************************************************************************

   Copyright: 2026 

   License: MIT license

   Authors: 

************************************************************************ */

qx.Class.define("qooxdo_proj.pages.StudentInfoTable",
{
  extend : qx.ui.tabview.Page,

  construct : function()
  {
    this.base(arguments, "Student Info Table");
    this.setLayout(new qx.ui.layout.VBox(10));
    this.setPadding(20);
    
    this._createTable();
  },

  members :
  {
    _progressiveTable : null,
    _studentDataModel : null,
    _studentRowNumber : 0,

    _createTable : function()
    {
      // Create ProgressiveTable structure
      const columnWidths = new qx.ui.progressive.renderer.table.Widths(6);
      columnWidths.setWidth(0, 50);   // # column
      columnWidths.setWidth(1, 120);  // Student ID column
      columnWidths.setWidth(2, 150);  // First Name column
      columnWidths.setWidth(3, 150);  // Last Name column
      columnWidths.setWidth(4, 250);  // Program column
      columnWidths.setWidth(5, 100);  // Year Level column

      const columnNames = ["#", "Student Id", "First Name", "Last Name", "Program", "Year Level"];

      // Create Progressive with header and footer
      const tableHeader = new qx.ui.progressive.headfoot.TableHeading(columnWidths, columnNames);
      const tableFooter = new qx.ui.progressive.headfoot.Progress(columnWidths, columnNames);
      const structure = new qx.ui.progressive.structure.Default(tableHeader, tableFooter);
      this._progressiveTable = new qx.ui.progressive.Progressive(structure);

      // Create data model for students
      this._studentDataModel = new qx.ui.progressive.model.Default();

      // Set data model
      this._progressiveTable.setDataModel(this._studentDataModel);

      // Create table row renderer
      const renderer = new qx.ui.progressive.renderer.table.Row(columnWidths);
      this._progressiveTable.addRenderer("row", renderer);

      this._progressiveTable.set({
        width: 800,
        height: 400
      });

      this.add(this._progressiveTable, { flex: 1 });
    },

    // Public method to add a student to the table
    addStudent : function(studentData)
    {
      this._studentRowNumber++;
      const rowData = {
        renderer: "row",
        location: "end",
        data: [
          this._studentRowNumber,
          studentData.studentId || "",
          studentData.firstName || "",
          studentData.lastName || "",
          studentData.program || "",
          studentData.yearLevel || ""
        ]
      };
      
      this._studentDataModel.addElements([rowData]);
      this._progressiveTable.render();
    },

    // Clear all students
    clear : function()
    {
      this._studentDataModel = new qx.ui.progressive.model.Default();
      this._progressiveTable.setDataModel(this._studentDataModel);
      this._studentRowNumber = 0;
      this._progressiveTable.render();
    }
  }
});
