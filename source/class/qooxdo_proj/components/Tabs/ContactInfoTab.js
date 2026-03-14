/* ************************************************************************

   Copyright: 2026

   License: MIT license

   Authors:

****************************************************** ****************** */
qx.Class.define("qooxdo_proj.components.Tabs.ContactInfoTab", {
    extend: qx.ui.tabview.Page,
    construct: function () {
        this.base(arguments, "Contact Info");
        this.setLayout(new qx.ui.layout.VBox(10));
        this.setPadding(20);
        this._createForm();
    },
    members: {
        _emailField: null,
        _personalPhoneField: null,
        _emergencyContactField: null,
        _emergencyContactPhoneField: null,
        _relationshipField: null,
        _createForm: function () {
            const grid = new qx.ui.container.Composite();
            const gridLayout = new qx.ui.layout.Grid(15, 5);
            gridLayout.setColumnFlex(1, 1);
            gridLayout.setColumnMinWidth(1, 180);
            grid.setLayout(gridLayout);
            // Contact Info Fields
            this._emailField = new qooxdo_proj.components.ui.TextField();
            const emailLabel = new qooxdo_proj.components.ui.Label("Email:");
            grid.add(emailLabel, { row: 0, column: 0 });
            grid.add(this._emailField, { row: 0, column: 1 });
            this._personalPhoneField = new qooxdo_proj.components.ui.TextField();
            const personalPhoneLabel = new qooxdo_proj.components.ui.Label("Personal Phone:");
            grid.add(personalPhoneLabel, { row: 1, column: 0 });
            grid.add(this._personalPhoneField, { row: 1, column: 1 });
            this._personalPhoneField.setMinWidth(0);
            this._personalPhoneField.setMaxWidth(520);
            this._emergencyContactField = new qooxdo_proj.components.ui.TextField();
            const emergencyContactLabel = new qooxdo_proj.components.ui.Label("Emergency Contact:");
            grid.add(emergencyContactLabel, { row: 2, column: 0 });
            grid.add(this._emergencyContactField, { row: 2, column: 1 });
            this._emergencyContactField.setMinWidth(0);
            this._emergencyContactField.setMaxWidth(520);
            this._emergencyContactPhoneField = new qooxdo_proj.components.ui.TextField();
            const emergencyContactPhoneLabel = new qooxdo_proj.components.ui.Label("Emergency Contact Phone:");
            grid.add(emergencyContactPhoneLabel, { row: 3, column: 0 });
            grid.add(this._emergencyContactPhoneField, { row: 3, column: 1 });
            this._emergencyContactPhoneField.setMinWidth(0);
            this._emergencyContactPhoneField.setMaxWidth(520);
            this._relationshipField = new qooxdo_proj.components.ui.TextField();
            const relationshipLabel = new qooxdo_proj.components.ui.Label("Relationship:");
            grid.add(relationshipLabel, { row: 4, column: 0 });
            grid.add(this._relationshipField, { row: 4, column: 1 });
            this._relationshipField.setMinWidth(0);
            this._relationshipField.setMaxWidth(520);
            this.add(grid, { flex: 1 });
        },
        // Public methods to get form data
        getData: function () {
            return {
                email: this._emailField.getValue() || "",
                personalPhone: this._personalPhoneField.getValue() || "",
                emergencyContact: this._emergencyContactField.getValue() || "",
                emergencyContactPhone: this._emergencyContactPhoneField.getValue() || "",
                relationship: this._relationshipField.getValue() || ""
            };
        },
        // Validate form
        validate: function () {
            if (!this._emailField.getValue()) {
                return { valid: false, message: "Email is required" };
            }
            return { valid: true };
        },
        // Clear form
        clear: function () {
            this._emailField.setValue("");
            this._personalPhoneField.setValue("");
            this._emergencyContactField.setValue("");
            this._emergencyContactPhoneField.setValue("");
            this._relationshipField.setValue("");
        }
    }
});
