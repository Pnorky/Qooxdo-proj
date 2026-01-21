/* ************************************************************************

   Copyright: 2026 

   License: MIT license

   Authors: 

************************************************************************ */

qx.Class.define("qooxdo_proj.pages.ContactInfoTab",
{
  extend : qx.ui.tabview.Page,

  construct : function()
  {
    this.base(arguments, "Contact Info");
    this.setLayout(new qx.ui.layout.VBox(10));
    this.setPadding(20);
    
    this._createForm();
  },

  members :
  {
    _emailField : null,
    _personalPhoneField : null,
    _emergencyContactField : null,
    _emergencyContactPhoneField : null,
    _relationshipField : null,

    _createForm : function()
    {
      const grid = new qx.ui.container.Composite();
      grid.setLayout(new qx.ui.layout.Grid(5, 5));

      // Contact Info Fields
      this._emailField = new qx.ui.form.TextField();
      grid.add(new qx.ui.basic.Label("Email:"), { row: 0, column: 0 });
      grid.add(this._emailField, { row: 0, column: 1 });

      this._personalPhoneField = new qx.ui.form.TextField();
      grid.add(new qx.ui.basic.Label("Personal Phone:"), { row: 1, column: 0 });
      grid.add(this._personalPhoneField, { row: 1, column: 1 });

      this._emergencyContactField = new qx.ui.form.TextField();
      grid.add(new qx.ui.basic.Label("Emergency Contact:"), { row: 2, column: 0 });
      grid.add(this._emergencyContactField, { row: 2, column: 1 });

      this._emergencyContactPhoneField = new qx.ui.form.TextField();
      grid.add(new qx.ui.basic.Label("Emergency Contact Phone:"), { row: 3, column: 0 });
      grid.add(this._emergencyContactPhoneField, { row: 3, column: 1 });

      this._relationshipField = new qx.ui.form.TextField();
      grid.add(new qx.ui.basic.Label("Relationship:"), { row: 4, column: 0 });
      grid.add(this._relationshipField, { row: 4, column: 1 });

      this.add(grid, { flex: 1 });
    },

    // Public methods to get form data
    getData : function()
    {
      return {
        email: this._emailField.getValue() || "",
        personalPhone: this._personalPhoneField.getValue() || "",
        emergencyContact: this._emergencyContactField.getValue() || "",
        emergencyContactPhone: this._emergencyContactPhoneField.getValue() || "",
        relationship: this._relationshipField.getValue() || ""
      };
    },

    // Validate form
    validate : function()
    {
      if (!this._emailField.getValue()) {
        return { valid: false, message: "Email is required" };
      }
      return { valid: true };
    },

    // Clear form
    clear : function()
    {
      this._emailField.setValue("");
      this._personalPhoneField.setValue("");
      this._emergencyContactField.setValue("");
      this._emergencyContactPhoneField.setValue("");
      this._relationshipField.setValue("");
    }
  }
});
