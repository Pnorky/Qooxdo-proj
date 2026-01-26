/* ************************************************************************

   Copyright: 2026 

   License: MIT license

   Authors: 

****************************************************** ****************** */

qx.Class.define("qooxdo_proj.components.Tabs.ContactInfoTab",
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
      grid.setLayout(new qx.ui.layout.Grid(15, 5));

      // Contact Info Fields
      this._emailField = new qooxdo_proj.components.ui.TextField();
      const emailLabel = new qooxdo_proj.components.ui.Label("Email:");
      emailLabel.setWidth(180); // Fixed width to prevent truncation
      grid.add(emailLabel, { row: 0, column: 0 });
      grid.add(this._emailField, { row: 0, column: 1 });

      this._personalPhoneField = new qooxdo_proj.components.ui.TextField();
      const personalPhoneLabel = new qooxdo_proj.components.ui.Label("Personal Phone:");
      personalPhoneLabel.setWidth(180);
      grid.add(personalPhoneLabel, { row: 1, column: 0 });
      grid.add(this._personalPhoneField, { row: 1, column: 1 });
      this._personalPhoneField.setWidth(300);

      this._emergencyContactField = new qooxdo_proj.components.ui.TextField();
      const emergencyContactLabel = new qooxdo_proj.components.ui.Label("Emergency Contact:");
      emergencyContactLabel.setWidth(180);
      grid.add(emergencyContactLabel, { row: 2, column: 0 });
      grid.add(this._emergencyContactField, { row: 2, column: 1 });
      this._emergencyContactField.setWidth(300);

      this._emergencyContactPhoneField = new qooxdo_proj.components.ui.TextField();
      const emergencyContactPhoneLabel = new qooxdo_proj.components.ui.Label("Emergency Contact Phone:");
      emergencyContactPhoneLabel.setWidth(180);
      grid.add(emergencyContactPhoneLabel, { row: 3, column: 0 });
      grid.add(this._emergencyContactPhoneField, { row: 3, column: 1 });
      this._emergencyContactPhoneField.setWidth(300);
      
      this._relationshipField = new qooxdo_proj.components.ui.TextField();
      const relationshipLabel = new qooxdo_proj.components.ui.Label("Relationship:");
      relationshipLabel.setWidth(180);
      grid.add(relationshipLabel, { row: 4, column: 0 });
      grid.add(this._relationshipField, { row: 4, column: 1 });
      this._relationshipField.setWidth(300);
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
