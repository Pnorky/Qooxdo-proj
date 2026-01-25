/* ************************************************************************

   Copyright: 2026 

   License: MIT license

   Authors: 

************************************************************************ */

qx.Class.define("qooxdo_proj.components.Tabs.PersonalInfoTab", {
  extend: qx.ui.tabview.Page,

  construct: function () {
    this.base(arguments, "Personal Info");
    this.setLayout(new qx.ui.layout.VBox(10));
    this.setPadding(20);

    this._createForm();
  },

  members: {
    _studentIdField: null,
    _firstNameField: null,
    _lastNameField: null,
    _dobField: null,
    _genderField: null,
    _addressField: null,

    _createForm: function () {
      const grid = new qx.ui.container.Composite();
      grid.setLayout(new qx.ui.layout.Grid(5, 5));

      // Personal Info Fields
      //this._studentIdField = new qx.ui.form.TextField();
      this._studentIdField = new qooxdo_proj.components.ui.TextField();
      grid.add(new qooxdo_proj.components.ui.Label("Student ID:"), {
        row: 0,
        column: 0,
      });
      grid.add(this._studentIdField, { row: 0, column: 1 });

      this._firstNameField = new qooxdo_proj.components.ui.TextField();
      grid.add(new qooxdo_proj.components.ui.Label("First Name:"), { row: 1, column: 0 });
      grid.add(this._firstNameField, { row: 1, column: 1 });

      this._lastNameField = new qooxdo_proj.components.ui.TextField();
      grid.add(new qooxdo_proj.components.ui.Label("Last Name:"), { row: 2, column: 0 });
      grid.add(this._lastNameField, { row: 2, column: 1 });

      this._dobField = new qx.ui.form.DateField();
      grid.add(new qooxdo_proj.components.ui.Label("Date of Birth:"), { row: 3, column: 0 });
      grid.add(this._dobField, { row: 3, column: 1 });

      this._genderField = new qooxdo_proj.components.ui.ComboBox();
      this._genderField.add(new qx.ui.form.ListItem("Male"));
      this._genderField.add(new qx.ui.form.ListItem("Female"));
      grid.add(new qooxdo_proj.components.ui.Label("Gender:"), { row: 4, column: 0 });
      grid.add(this._genderField, { row: 4, column: 1 });

      // Address field with inline label
      const addressContainer = new qx.ui.container.Composite();
      const addressLayout = new qx.ui.layout.HBox(10);
      addressLayout.setAlignY("top");
      addressContainer.setLayout(addressLayout);
      addressContainer.add(new qooxdo_proj.components.ui.Label("Address:"));
      this._addressField = new qooxdo_proj.components.ui.TextArea();
      this._addressField.setHeight(100);
      this._addressField.setMinWidth(400);
      this._addressField.setWidth(400);
      addressContainer.add(this._addressField);
      grid.add(addressContainer, { row: 5, column: 0, colSpan: 2 });

      this.add(grid, { flex: 1 });
    },

    // Public methods to get form data
    getData: function () {
      return {
        studentId: this._studentIdField.getValue() || "",
        firstName: this._firstNameField.getValue() || "",
        lastName: this._lastNameField.getValue() || "",
        dateOfBirth: this._dobField.getValue(),
        gender:
          this._genderField.getSelection() &&
            this._genderField.getSelection().length > 0
            ? this._genderField.getSelection()[0].getLabel()
            : "",
        address: this._addressField.getValue() || "",
      };
    },

    // Validate form
    validate: function () {
      if (
        !this._studentIdField.getValue() ||
        !this._firstNameField.getValue() ||
        !this._lastNameField.getValue()
      ) {
        return {
          valid: false,
          message:
            "Please fill required Personal Info fields (Student ID, First Name, Last Name)",
        };
      }
      return { valid: true };
    },

    // Clear form
    clear: function () {
      this._studentIdField.setValue("");
      this._firstNameField.setValue("");
      this._lastNameField.setValue("");
      this._dobField.setValue(null);
      this._genderField.resetSelection();
      this._addressField.setValue("");
    },
  },
});
