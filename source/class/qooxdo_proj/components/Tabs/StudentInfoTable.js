/* ************************************************************************

   Copyright: 2026 

   License: MIT license

   Authors: 

************************************************************************ */

qx.Class.define("qooxdo_proj.components.Tabs.StudentInfoTable",
  {
    extend: qx.ui.tabview.Page,

    construct: function () {
      this.base(arguments, "Student Info Table");
      this.setLayout(new qx.ui.layout.VBox(10));
      this.setPadding(10);
      this._createTable();
    },

    members:
    {
      _table: null,
      _studentRowNumber: 0,

      _createTable: function () {
        // Create custom Table component with Basecoat UI styling
        this._table = new qooxdo_proj.components.ui.Table("Student Information Table");
        
        // Set table headers
        const columnNames = ["#", "Student Id", "First Name", "Last Name", "Program", "Year Level"];
        this._table.setHeaders(columnNames);

        // Set table size
        this._table.set({
          width: 800,
          height: 400
        });

        this.add(this._table, { flex: 1 });
      },

      // Public method to add a student to the table
      addStudent: function (studentData) {
        this._studentRowNumber++;
        const rowData = [
          this._studentRowNumber,
          studentData.studentId || "",
          { text: studentData.firstName || "", classes: "font-medium" },
          { text: studentData.lastName || "", classes: "font-medium" },
          studentData.program || "",
          studentData.yearLevel || ""
        ];

        this._table.addRow(rowData);
      },

      // Clear all students
      clear: function () {
        this._table.clearRows();
        this._studentRowNumber = 0;
      }
    }
  });
