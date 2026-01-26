/* ************************************************************************

   Copyright: 2026 

   License: MIT license

   Authors: 

************************************************************************ */

qx.Class.define("qooxdo_proj.components.MenuBar",
  {
    extend: qx.ui.container.Composite,

    construct: function () {
      this.base(arguments);

      var frame = new qx.ui.container.Composite(new qx.ui.layout.Grow());
      frame.setAllowStretchX(true);
      this.setLayout(new qx.ui.layout.Grow());
      this.setAllowStretchX(true);

      var menubar = new qx.ui.menubar.MenuBar();
      menubar.setAllowGrowX(true);
      frame.add(menubar);

      var windowsMenu = new qx.ui.menubar.Button("Students", null, this._getWindowsMenu());
      // var viewMenu = new qx.ui.menubar.Button("View", null, this._getViewMenu());
      var windowMenu = new qx.ui.menubar.Button("Window", null, this._getWindowMenu());

      menubar.add(windowsMenu);
      // menubar.add(viewMenu);
      menubar.add(windowMenu);

      this.add(frame);
    },

    members:
    {
      _windowManager: null,
      _showPersonalInfoCheckbox: null,
      _showContactInfoCheckbox: null,
      _showAcademicInfoCheckbox: null,
      _showStudentTableCheckbox: null,

      /**
       * Set the window manager reference
       * @param {qooxdo_proj.components.WindowManager} windowManager
       */
      setWindowManager: function (windowManager) {
        this._windowManager = windowManager;
      },

      _getWindowsMenu: function () {
        var menu = new qx.ui.menu.Menu();

        var personalInfoButton = new qx.ui.menu.Button("Personal Information");
        var contactInfoButton = new qx.ui.menu.Button("Contact Information");
        var academicInfoButton = new qx.ui.menu.Button("Academic Information");
        var studentTableButton = new qx.ui.menu.Button("Student Table");

        menu.add(personalInfoButton);
        menu.add(contactInfoButton);
        menu.add(academicInfoButton);
        menu.add(studentTableButton);

        // Event handlers
        personalInfoButton.addListener("execute", () => {
          if (this._windowManager) {
            this._windowManager.openWindow("personalInfo");
          }
        }, this);

        contactInfoButton.addListener("execute", () => {
          if (this._windowManager) {
            this._windowManager.openWindow("contactInfo");
          }
        }, this);

        academicInfoButton.addListener("execute", () => {
          if (this._windowManager) {
            this._windowManager.openWindow("academicInfo");
          }
        }, this);

        studentTableButton.addListener("execute", () => {
          if (this._windowManager) {
            this._windowManager.openWindow("studentTable");
          }
        }, this);

        return menu;
      },

      _getWindowMenu: function () {
        var menu = new qx.ui.menu.Menu();

        var cascadeWindowsButton = new qx.ui.menu.Button("Cascade Windows");
        var tileWindowsButton = new qx.ui.menu.Button("Tile Windows");
        var closeAllButton = new qx.ui.menu.Button("Close All Windows");

        menu.add(cascadeWindowsButton);
        menu.add(tileWindowsButton);
        menu.addSeparator();
        menu.add(closeAllButton);

        // Event handlers
        cascadeWindowsButton.addListener("execute", () => {
          if (this._windowManager) {
            this._windowManager.cascadeWindows();
          }
        }, this);

        tileWindowsButton.addListener("execute", () => {
          if (this._windowManager) {
            this._windowManager.tileWindows();
          }
        }, this);

        closeAllButton.addListener("execute", () => {
          if (this._windowManager) {
            this._windowManager.closeAllWindows();
            // Uncheck all checkboxes in View menu
            // if (this._showPersonalInfoCheckbox) {
            //   this._showPersonalInfoCheckbox.setValue(false);
            // }
            // if (this._showContactInfoCheckbox) {
            //   this._showContactInfoCheckbox.setValue(false);
            // }
            // if (this._showAcademicInfoCheckbox) {
            //   this._showAcademicInfoCheckbox.setValue(false);
            // }
            // if (this._showStudentTableCheckbox) {
            //   this._showStudentTableCheckbox.setValue(false);
            // }
          }
        }, this);

        return menu;
      },

      // _getViewMenu: function () {
      //   var menu = new qx.ui.menu.Menu();

      //   this._showPersonalInfoCheckbox = new qx.ui.menu.CheckBox("Show Personal Info Window");
      //   this._showContactInfoCheckbox = new qx.ui.menu.CheckBox("Show Contact Info Window");
      //   this._showAcademicInfoCheckbox = new qx.ui.menu.CheckBox("Show Academic Info Window");
      //   this._showStudentTableCheckbox = new qx.ui.menu.CheckBox("Show Student Table Window");

      //   // Start unchecked since windows are not displayed automatically upon login
      //   this._showPersonalInfoCheckbox.setValue(false);
      //   this._showContactInfoCheckbox.setValue(false);
      //   this._showAcademicInfoCheckbox.setValue(false);
      //   this._showStudentTableCheckbox.setValue(false);

      //   this._showPersonalInfoCheckbox.addListener("changeValue", (e) => {
      //     if (this._windowManager) {
      //       if (e.getData()) {
      //         this._windowManager.openWindow("personalInfo");
      //       } else {
      //         this._windowManager.closeWindow("personalInfo");
      //       }
      //     }
      //   }, this);
      //   this._showContactInfoCheckbox.addListener("changeValue", (e) => {
      //     if (this._windowManager) {
      //       if (e.getData()) {
      //         this._windowManager.openWindow("contactInfo");
      //       } else {
      //         this._windowManager.closeWindow("contactInfo");
      //       }
      //     }
      //   }, this);
      //   this._showAcademicInfoCheckbox.addListener("changeValue", (e) => {
      //     if (this._windowManager) {
      //       if (e.getData()) {
      //         this._windowManager.openWindow("academicInfo");
      //       } else {
      //         this._windowManager.closeWindow("academicInfo");
      //       }
      //     }
      //   }, this);
      //   this._showStudentTableCheckbox.addListener("changeValue", (e) => {
      //     if (this._windowManager) {
      //       if (e.getData()) {
      //         this._windowManager.openWindow("studentTable");
      //       } else {
      //         this._windowManager.closeWindow("studentTable");
      //       }
      //     }
      //   }, this);

      //   menu.add(this._showPersonalInfoCheckbox);
      //   menu.add(this._showContactInfoCheckbox);
      //   menu.add(this._showAcademicInfoCheckbox);
      //   menu.add(this._showStudentTableCheckbox);

      //   return menu;
      // }
    },

    /*
     *****************************************************************************
        DESTRUCT
     *****************************************************************************
     */

    destruct: function () {
      // Cleanup if needed
    }
  });
