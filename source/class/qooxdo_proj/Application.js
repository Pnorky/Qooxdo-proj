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



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     *
     * @lint ignoreDeprecated(alert)
     */
    main()
    {
      // Call super class
      super.main();

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      /*
      -------------------------------------------------------------------------
        Below is your actual application code...
      -------------------------------------------------------------------------
      */

      // Create a button
      const button1 = new qx.ui.form.Button("Click me");

      // Label
      const label = new qx.ui.basic.Label("Hello Qooxdoo!");

      // Text field
      const textField = new qx.ui.form.TextField();
      const textFieldLabel = new qx.ui.basic.Label("Text Field:");

      // Text area
      const textArea = new qx.ui.form.TextArea();
      const textAreaLabel = new qx.ui.basic.Label("Text Area:");

      // Combo box with options
      const comboBox = new qx.ui.form.ComboBox();
      const comboBoxLabel = new qx.ui.basic.Label("Combo Box:");
      comboBox.add(new qx.ui.form.ListItem("Option 1", null, "option1"));
      comboBox.add(new qx.ui.form.ListItem("Option 2", null, "option2"));
      comboBox.add(new qx.ui.form.ListItem("Option 3", null, "option3"));
      comboBox.add(new qx.ui.form.ListItem("Option 4", null, "option4"));

      // Radio button group with labels
      const radioButtonGroup = new qx.ui.form.RadioGroup();
      const radioButtonLabel = new qx.ui.basic.Label("Radio Button:");
      const radioButton1 = new qx.ui.form.RadioButton("Option A");
      const radioButton2 = new qx.ui.form.RadioButton("Option B");
      const radioButton3 = new qx.ui.form.RadioButton("Option C");
      radioButtonGroup.add(radioButton1);
      radioButtonGroup.add(radioButton2);
      radioButtonGroup.add(radioButton3);

      // Check box with label after it
      const checkBox = new qx.ui.form.CheckBox();
      const checkBoxLabel = new qx.ui.basic.Label("Check Box:");
      const isActiveLabel = new qx.ui.basic.Label("Is Active:");

      // Document is the application root
      const doc = this.getRoot();

      // Add button to document at fixed coordinates
      doc.add(button1, {left: 100, top: 50});

      // Add label to document at fixed coordinates
      doc.add(label, {left: 100, top: 100});

      // Add text field label and field to document at fixed coordinates
      doc.add(textFieldLabel, {left: 100, top: 130});
      doc.add(textField, {left: 100, top: 150});

      // Add text area label and area to document at fixed coordinates
      doc.add(textAreaLabel, {left: 100, top: 180});
      doc.add(textArea, {left: 100, top: 200});

      // Add combo box label and combo box to document at fixed coordinates
      doc.add(comboBoxLabel, {left: 100, top: 300});
      doc.add(comboBox, {left: 100, top: 320});

      // Add radio button label and radio buttons with their labels to document at fixed coordinates
      doc.add(radioButtonLabel, {left: 100, top: 360});
      doc.add(radioButton1, {left: 100, top: 380});
      doc.add(radioButton2, {left: 100, top: 400});
      doc.add(radioButton3, {left: 100, top: 420});

      // Add check box and label (label after checkbox) to document at fixed coordinates
      doc.add(checkBox, {left: 160, top: 485});
      doc.add(checkBoxLabel, {left: 100, top: 460});
      doc.add(isActiveLabel, {left: 100, top: 480});

      // Add an event listener
      button1.addListener("execute", function() {
        /* eslint no-alert: "off" */
        alert("Hello World!");
      });
    }
  }
});
