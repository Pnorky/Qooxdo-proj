/* ************************************************************************

   Copyright: 2026 

   License: MIT license

   Authors: 

************************************************************************ */

qx.Class.define("qooxdo_proj.components.Windows.StudentInfoTableWindow",
{
  extend : qx.ui.window.Window,

  construct : function()
  {
    this.base(arguments, "Student Information Table");
    
    this.setLayout(new qx.ui.layout.VBox(10));
    this.setWidth(800);
    this.setHeight(500);
    this.setAllowClose(true);
    this.setAllowMaximize(false);
    this.setAllowMinimize(true);
    this.setResizable(true);
    this.setMovable(true);

    // Create the StudentInfoTable component
    this._studentInfoTable = new qooxdo_proj.components.Tabs.StudentInfoTable();
    
    // Add the tab page directly to the window (it's a container)
    this.add(this._studentInfoTable, { flex: 1 });
  },

  members :
  {
    _studentInfoTable : null,

    /**
     * Get the StudentInfoTable component
     * @return {qooxdo_proj.components.Tabs.StudentInfoTable} The student info table component
     */
    getStudentInfoTable : function()
    {
      return this._studentInfoTable;
    },

    /**
     * Add a student to the table
     * @param {Object} studentData - Student data object
     */
    addStudent : function(studentData)
    {
      if (this._studentInfoTable) {
        this._studentInfoTable.addStudent(studentData);
      }
    },

    /**
     * Clear all students from the table
     */
    clear : function()
    {
      if (this._studentInfoTable) {
        this._studentInfoTable.clear();
      }
    },

    /**
     * Load students from API
     */
    loadStudents : function()
    {
      if (this._studentInfoTable) {
        this._studentInfoTable.loadStudents();
      }
    }
  }
});
