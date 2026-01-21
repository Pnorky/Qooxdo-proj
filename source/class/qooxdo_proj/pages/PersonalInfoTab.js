/* ************************************************************************

   Copyright: 2026 

   License: MIT license

   Authors: 

************************************************************************ */

qx.Class.define("qooxdo_proj.pages.PersonalInfoTab",
{
  extend : qx.ui.tabview.Page,

  construct : function()
  {
    this.base(arguments, "Personal Info", "icons/16/apps/internet-web-browser.png");
    this.setLayout(new qx.ui.layout.VBox(10));
    this.setPadding(20);
    
    this._createForm();
  },

  members :
  {
    _studentIdField : null,
    _firstNameField : null,
    _lastNameField : null,
    _dobField : null,
    _genderField : null,
    _addressField : null,

    _createForm : function()
    {
      const grid = new qx.ui.container.Composite();
      grid.setLayout(new qx.ui.layout.Grid(5, 5));

      // Personal Info Fields
      this._studentIdField = new qx.ui.form.TextField();
      grid.add(new qx.ui.basic.Label("Student ID:"), { row: 0, column: 0 });
      grid.add(this._studentIdField, { row: 0, column: 1 });

      this._firstNameField = new qx.ui.form.TextField();
      grid.add(new qx.ui.basic.Label("First Name:"), { row: 1, column: 0 });
      grid.add(this._firstNameField, { row: 1, column: 1 });

      this._lastNameField = new qx.ui.form.TextField();
      grid.add(new qx.ui.basic.Label("Last Name:"), { row: 2, column: 0 });
      grid.add(this._lastNameField, { row: 2, column: 1 });

      this._dobField = new qx.ui.form.DateField();
      grid.add(new qx.ui.basic.Label("Date of Birth:"), { row: 3, column: 0 });
      grid.add(this._dobField, { row: 3, column: 1 });

      this._genderField = new qx.ui.form.ComboBox();
      this._genderField.add(new qx.ui.form.ListItem("Male"));
      this._genderField.add(new qx.ui.form.ListItem("Female"));
      grid.add(new qx.ui.basic.Label("Gender:"), { row: 4, column: 0 });
      grid.add(this._genderField, { row: 4, column: 1 });
      
      this._addressField = new qx.ui.form.TextArea();
      grid.add(new qx.ui.basic.Label("Address:"), { row: 5, column: 0 });
      grid.add(this._addressField, { row: 5, column: 1 });

      this.add(grid, { flex: 1 });
    },

    // Public methods to get form data
    getData : function()
    {
      return {
        studentId: this._studentIdField.getValue() || "",
        firstName: this._firstNameField.getValue() || "",
        lastName: this._lastNameField.getValue() || "",
        dateOfBirth: this._dobField.getValue(),
        gender: this._genderField.getSelection() && this._genderField.getSelection().length > 0 
          ? this._genderField.getSelection()[0].getLabel() : "",
        address: this._addressField.getValue() || ""
      };
    },

    // Validate form
    validate : function()
    {
      if (!this._studentIdField.getValue() || !this._firstNameField.getValue() || !this._lastNameField.getValue()) {
        return { valid: false, message: "Please fill required Personal Info fields (Student ID, First Name, Last Name)" };
      }
      return { valid: true };
    },

    // Clear form
    clear : function()
    {
      this._studentIdField.setValue("");
      this._firstNameField.setValue("");
      this._lastNameField.setValue("");
      this._dobField.setValue(null);
      this._genderField.setSelection([]);
      this._addressField.setValue("");
    }
  }
});
