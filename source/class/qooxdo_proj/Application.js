/* ************************************************************************

   Copyright: 2026 

   License: MIT license

   Authors: 

************************************************************************ */

/**
 * This is the main application class of "qooxdo_proj"
 *
 * @asset(qooxdo_proj/*)
 */
qx.Class.define("qooxdo_proj.Application",
{
  extend : qx.application.Standalone,

  members :
  {
    main()
    {
      super.main();

      const root = this.getRoot();
      const rootContainer = new qx.ui.container.Composite();
      rootContainer.setLayout(new qx.ui.layout.Canvas());

      const form = new qx.ui.container.Composite();
      form.setLayout(new qx.ui.layout.VBox(10));
      form.setPadding(20);

      // Header
      const header = new qx.ui.basic.Label("Student Registration Form");
      form.add(header);

      // Form fields
      const formGrid = new qx.ui.container.Composite();
      formGrid.setLayout(new qx.ui.layout.Grid(5, 5));

      // Row 0: Student ID | First Name
      const studentIdField = new qx.ui.form.TextField();
      formGrid.add(new qx.ui.basic.Label("Student ID:"), {row: 0, column: 0});
      formGrid.add(studentIdField, {row: 0, column: 1});

      const firstNameField = new qx.ui.form.TextField();
      formGrid.add(new qx.ui.basic.Label("First Name:"), {row: 0, column: 2});
      formGrid.add(firstNameField, {row: 0, column: 3});

      // Row 1: Last Name | Date of Birth
      const lastNameField = new qx.ui.form.TextField();
      formGrid.add(new qx.ui.basic.Label("Last Name:"), {row: 1, column: 0});
      formGrid.add(lastNameField, {row: 1, column: 1});

      const dobField = new qx.ui.form.DateField();
      formGrid.add(new qx.ui.basic.Label("Date of Birth:"), {row: 1, column: 2});
      formGrid.add(dobField, {row: 1, column: 3});

      // Row 2: Email | Phone
      const emailField = new qx.ui.form.TextField();
      formGrid.add(new qx.ui.basic.Label("Email:"), {row: 2, column: 0});
      formGrid.add(emailField, {row: 2, column: 1});

      const phoneField = new qx.ui.form.TextField();
      formGrid.add(new qx.ui.basic.Label("Phone:"), {row: 2, column: 2});
      formGrid.add(phoneField, {row: 2, column: 3});

      // Row 3: Program | Year Level
      const programField = new qx.ui.form.TextField();
      formGrid.add(new qx.ui.basic.Label("Program:"), {row: 3, column: 0});
      formGrid.add(programField, {row: 3, column: 1});

      const yearCombo = new qx.ui.form.ComboBox();
      yearCombo.add(new qx.ui.form.ListItem("1st Year"));
      yearCombo.add(new qx.ui.form.ListItem("2nd Year"));
      yearCombo.add(new qx.ui.form.ListItem("3rd Year"));
      yearCombo.add(new qx.ui.form.ListItem("4th Year"));
      formGrid.add(new qx.ui.basic.Label("Year Level:"), {row: 3, column: 2});
      formGrid.add(yearCombo, {row: 3, column: 3});

      // Row 4: Address (full width)
      const addressTextArea = new qx.ui.form.TextArea();
      addressTextArea.setHeight(60);
      formGrid.add(new qx.ui.basic.Label("Address:"), {row: 4, column: 0});
      formGrid.add(addressTextArea, {row: 4, column: 1, colSpan: 3});

      // Row 5: Emergency Contact | Contact Phone
      const contactNameField = new qx.ui.form.TextField();
      formGrid.add(new qx.ui.basic.Label("Emergency Contact:"), {row: 5, column: 0});
      formGrid.add(contactNameField, {row: 5, column: 1});

      const contactPhoneField = new qx.ui.form.TextField();
      formGrid.add(new qx.ui.basic.Label("Contact Phone:"), {row: 5, column: 2});
      formGrid.add(contactPhoneField, {row: 5, column: 3});

      // Row 6: Relationship
      const relationshipField = new qx.ui.form.TextField();
      formGrid.add(new qx.ui.basic.Label("Relationship:"), {row: 6, column: 0});
      formGrid.add(relationshipField, {row: 6, column: 1});

      form.add(formGrid);

      // Buttons
      const buttonContainer = new qx.ui.container.Composite();
      buttonContainer.setLayout(new qx.ui.layout.HBox(10));

      const submitButton = new qx.ui.form.Button("Submit");
      const clearButton = new qx.ui.form.Button("Clear");
      const pressMeButton = new qx.ui.form.Button("Press Me");
      const resetCounterButton = new qx.ui.form.Button("Reset Counter");

      buttonContainer.add(submitButton);
      buttonContainer.add(clearButton);
      buttonContainer.add(pressMeButton);
      buttonContainer.add(resetCounterButton);
      form.add(buttonContainer);

      // Status
      const statusLabel = new qx.ui.basic.Label("");
      form.add(statusLabel);

      // Counter for Press Me button
      let clickCount = 0;

      // Event handlers
      submitButton.addListener("execute", () => {
        if (!studentIdField.getValue() || !firstNameField.getValue() || 
            !lastNameField.getValue() || !emailField.getValue()) {
          statusLabel.setValue("Error: Please fill required fields");
          return;
        }
        statusLabel.setValue("Registration submitted successfully");
        console.log("Form Data:", {
          studentId: studentIdField.getValue(),
          firstName: firstNameField.getValue(),
          lastName: lastNameField.getValue(),
          email: emailField.getValue()
        });
      });

      clearButton.addListener("execute", () => {
        studentIdField.setValue("");
        firstNameField.setValue("");
        lastNameField.setValue("");
        dobField.setValue(null);
        emailField.setValue("");
        phoneField.setValue("");
        programField.setValue("");
        yearCombo.setSelection([]);
        addressTextArea.setValue("");
        contactNameField.setValue("");
        contactPhoneField.setValue("");
        relationshipField.setValue("");
        statusLabel.setValue("");
      });

      pressMeButton.addListener("execute", () => {
        clickCount++;
        statusLabel.setValue(`Button clicked ${clickCount} time${clickCount !== 1 ? 's' : ''}`);
      });

      resetCounterButton.addListener("execute", () => {
        clickCount = 0;
        statusLabel.setValue("Counter reset to 0");
      });

      rootContainer.add(form, {left: 50, top: 50});
      root.add(rootContainer);
    }
  }
});
