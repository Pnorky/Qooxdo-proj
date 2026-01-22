/* ************************************************************************

   Copyright: 2026 

   License: MIT license

   Authors: 

************************************************************************ */

qx.Class.define("qooxdo_proj.components.MenuBar",
{
  extend : qx.ui.container.Composite,

  construct : function()
  {
    this.base(arguments);
    
    var frame = new qx.ui.container.Composite(new qx.ui.layout.Grow());
    frame.setAllowStretchX(true);
    this.setLayout(new qx.ui.layout.Grow());
    this.setAllowStretchX(true);

    var menubar = new qx.ui.menubar.MenuBar();
    menubar.setAllowGrowX(true);
    frame.add(menubar);

    // Create commands
    this._createCommands();

    var fileMenu = new qx.ui.menubar.Button("File", null, this._getFileMenu());
    var studentMenu = new qx.ui.menubar.Button("Student", null, this._getStudentMenu());
    var reportsMenu = new qx.ui.menubar.Button("Reports", null, this._getReportsMenu());
    var toolsMenu = new qx.ui.menubar.Button("Tools", null, this._getToolsMenu());
    var viewMenu = new qx.ui.menubar.Button("View", null, this._getViewMenu());
    var helpMenu = new qx.ui.menubar.Button("Help", null, this._getHelpMenu());

    menubar.add(fileMenu);
    menubar.add(studentMenu);
    menubar.add(reportsMenu);
    menubar.add(toolsMenu);
    menubar.add(viewMenu);
    menubar.add(helpMenu);

    this.add(frame);
  },

  members :
  {
    _newCommand : null,
    _openCommand : null,
    _saveCommand : null,
    _undoCommand : null,
    _redoCommand : null,
    _cutCommand : null,
    _copyCommand : null,
    _pasteCommand : null,

    _createCommands : function()
    {
      this._newCommand = new qx.ui.command.Command("Ctrl+N");
      this._newCommand.addListener("execute", () => {
        this.debug("Execute command: " + this._newCommand.getShortcut());
      }, this);

      this._openCommand = new qx.ui.command.Command("Ctrl+O");
      this._openCommand.addListener("execute", () => {
        this.debug("Execute command: " + this._openCommand.getShortcut());
      }, this);

      this._saveCommand = new qx.ui.command.Command("Ctrl+S");
      this._saveCommand.addListener("execute", () => {
        this.debug("Execute command: " + this._saveCommand.getShortcut());
      }, this);

      this._undoCommand = new qx.ui.command.Command("Ctrl+Z");
      this._undoCommand.addListener("execute", () => {
        this.debug("Execute command: " + this._undoCommand.getShortcut());
      }, this);

      this._redoCommand = new qx.ui.command.Command("Ctrl+R");
      this._redoCommand.addListener("execute", () => {
        this.debug("Execute command: " + this._redoCommand.getShortcut());
      }, this);

      this._cutCommand = new qx.ui.command.Command("Ctrl+X");
      this._cutCommand.addListener("execute", () => {
        this.debug("Execute command: " + this._cutCommand.getShortcut());
      }, this);

      this._copyCommand = new qx.ui.command.Command("Ctrl+C");
      this._copyCommand.addListener("execute", () => {
        this.debug("Execute command: " + this._copyCommand.getShortcut());
      }, this);

      this._pasteCommand = new qx.ui.command.Command("Ctrl+P");
      this._pasteCommand.addListener("execute", () => {
        this.debug("Execute command: " + this._pasteCommand.getShortcut());
      }, this);

      this._pasteCommand.setEnabled(false);
    },

    _getFileMenu : function()
    {
      var menu = new qx.ui.menu.Menu();

      var newStudentButton = new qx.ui.menu.Button(
        "New Student",
        "icon/16/actions/document-new.png",
        this._newCommand
      );
      var openRecordButton = new qx.ui.menu.Button(
        "Open Student Record",
        "icon/16/actions/document-open.png",
        this._openCommand
      );
      var saveButton = new qx.ui.menu.Button(
        "Save Student",
        "icon/16/actions/document-save.png",
        this._saveCommand
      );
      var exportButton = new qx.ui.menu.Button(
        "Export Data",
        "icon/16/actions/document-save-as.png"
      );
      var importButton = new qx.ui.menu.Button(
        "Import Data",
        "icon/16/actions/document-open.png"
      );
      var printButton = new qx.ui.menu.Button(
        "Print Student List",
        "icon/16/actions/document-print.png"
      );
      var exitButton = new qx.ui.menu.Button(
        "Exit",
        "icon/16/actions/application-exit.png"
      );

      newStudentButton.addListener("execute", () => {
        this.debug("Execute button: " + newStudentButton.getLabel());
      }, this);
      openRecordButton.addListener("execute", () => {
        this.debug("Execute button: " + openRecordButton.getLabel());
      }, this);
      saveButton.addListener("execute", () => {
        this.debug("Execute button: " + saveButton.getLabel());
      }, this);
      exportButton.addListener("execute", () => {
        this.debug("Execute button: " + exportButton.getLabel());
      }, this);
      importButton.addListener("execute", () => {
        this.debug("Execute button: " + importButton.getLabel());
      }, this);
      printButton.addListener("execute", () => {
        this.debug("Execute button: " + printButton.getLabel());
      }, this);
      exitButton.addListener("execute", () => {
        this.debug("Execute button: " + exitButton.getLabel());
      }, this);

      menu.add(newStudentButton);
      menu.add(openRecordButton);
      menu.add(saveButton);
      menu.addSeparator();
      menu.add(exportButton);
      menu.add(importButton);
      menu.add(printButton);
      menu.addSeparator();
      menu.add(exitButton);

      return menu;
    },

    _getStudentMenu : function()
    {
      var menu = new qx.ui.menu.Menu();

      var addStudentButton = new qx.ui.menu.Button(
        "Add New Student",
        "icon/16/actions/list-add.png"
      );
      var editStudentButton = new qx.ui.menu.Button(
        "Edit Student",
        "icon/16/actions/edit.png"
      );
      var deleteStudentButton = new qx.ui.menu.Button(
        "Delete Student",
        "icon/16/actions/edit-delete.png"
      );
      var viewStudentListButton = new qx.ui.menu.Button(
        "View Student List",
        "icon/16/apps/utilities-system-monitor.png"
      );
      var clearFormButton = new qx.ui.menu.Button(
        "Clear Form",
        "icon/16/actions/edit-clear.png"
      );

      addStudentButton.addListener("execute", () => {
        this.debug("Execute button: " + addStudentButton.getLabel());
      }, this);
      editStudentButton.addListener("execute", () => {
        this.debug("Execute button: " + editStudentButton.getLabel());
      }, this);
      deleteStudentButton.addListener("execute", () => {
        this.debug("Execute button: " + deleteStudentButton.getLabel());
      }, this);
      viewStudentListButton.addListener("execute", () => {
        this.debug("Execute button: " + viewStudentListButton.getLabel());
      }, this);
      clearFormButton.addListener("execute", () => {
        this.debug("Execute button: " + clearFormButton.getLabel());
      }, this);

      menu.add(addStudentButton);
      menu.add(editStudentButton);
      menu.add(deleteStudentButton);
      menu.addSeparator();
      menu.add(viewStudentListButton);
      menu.add(clearFormButton);

      return menu;
    },

    _getReportsMenu : function()
    {
      var menu = new qx.ui.menu.Menu();

      var studentListReportButton = new qx.ui.menu.Button(
        "Student List Report",
        "icon/16/apps/utilities-system-monitor.png"
      );
      var academicReportButton = new qx.ui.menu.Button(
        "Academic Report",
        "icon/16/actions/document-properties.png"
      );
      var enrollmentReportButton = new qx.ui.menu.Button(
        "Enrollment Statistics",
        "icon/16/apps/utilities-system-monitor.png"
      );
      var programReportButton = new qx.ui.menu.Button(
        "Program Distribution",
        "icon/16/actions/document-properties.png"
      );
      var exportReportButton = new qx.ui.menu.Button(
        "Export Report",
        "icon/16/actions/document-save-as.png"
      );
      var printReportButton = new qx.ui.menu.Button(
        "Print Report",
        "icon/16/actions/document-print.png"
      );

      studentListReportButton.addListener("execute", () => {
        this.debug("Execute button: " + studentListReportButton.getLabel());
      }, this);
      academicReportButton.addListener("execute", () => {
        this.debug("Execute button: " + academicReportButton.getLabel());
      }, this);
      enrollmentReportButton.addListener("execute", () => {
        this.debug("Execute button: " + enrollmentReportButton.getLabel());
      }, this);
      programReportButton.addListener("execute", () => {
        this.debug("Execute button: " + programReportButton.getLabel());
      }, this);
      exportReportButton.addListener("execute", () => {
        this.debug("Execute button: " + exportReportButton.getLabel());
      }, this);
      printReportButton.addListener("execute", () => {
        this.debug("Execute button: " + printReportButton.getLabel());
      }, this);

      menu.add(studentListReportButton);
      menu.add(academicReportButton);
      menu.add(enrollmentReportButton);
      menu.add(programReportButton);
      menu.addSeparator();
      menu.add(exportReportButton);
      menu.add(printReportButton);

      return menu;
    },

    _getViewMenu : function()
    {
      var menu = new qx.ui.menu.Menu();

      var showPersonalInfoCheckbox = new qx.ui.menu.CheckBox("Show Personal Info Tab");
      var showContactInfoCheckbox = new qx.ui.menu.CheckBox("Show Contact Info Tab");
      var showAcademicInfoCheckbox = new qx.ui.menu.CheckBox("Show Academic Info Tab");
      var showStudentTableCheckbox = new qx.ui.menu.CheckBox("Show Student Table");
      var refreshButton = new qx.ui.menu.Button(
        "Refresh",
        "icon/16/actions/view-refresh.png"
      );
      var fullScreenButton = new qx.ui.menu.Button("Full Screen");

      showPersonalInfoCheckbox.setValue(true);
      showContactInfoCheckbox.setValue(true);
      showAcademicInfoCheckbox.setValue(true);
      showStudentTableCheckbox.setValue(true);

      showPersonalInfoCheckbox.addListener("changeValue", (e) => {
        this.debug("Change checked: " + showPersonalInfoCheckbox.getLabel() + " = " + e.getData());
      }, this);
      showContactInfoCheckbox.addListener("changeValue", (e) => {
        this.debug("Change checked: " + showContactInfoCheckbox.getLabel() + " = " + e.getData());
      }, this);
      showAcademicInfoCheckbox.addListener("changeValue", (e) => {
        this.debug("Change checked: " + showAcademicInfoCheckbox.getLabel() + " = " + e.getData());
      }, this);
      showStudentTableCheckbox.addListener("changeValue", (e) => {
        this.debug("Change checked: " + showStudentTableCheckbox.getLabel() + " = " + e.getData());
      }, this);
      refreshButton.addListener("execute", () => {
        this.debug("Execute button: " + refreshButton.getLabel());
      }, this);
      fullScreenButton.addListener("execute", () => {
        this.debug("Execute button: " + fullScreenButton.getLabel());
      }, this);

      menu.add(showPersonalInfoCheckbox);
      menu.add(showContactInfoCheckbox);
      menu.add(showAcademicInfoCheckbox);
      menu.add(showStudentTableCheckbox);
      menu.addSeparator();
      menu.add(refreshButton);
      menu.add(fullScreenButton);

      return menu;
    },

    _getToolsMenu : function()
    {
      var menu = new qx.ui.menu.Menu();

      var searchStudentButton = new qx.ui.menu.Button(
        "Search Student",
        "icon/16/actions/system-search.png"
      );
      var filterStudentsButton = new qx.ui.menu.Button(
        "Filter Students",
        "icon/16/actions/view-filter.png"
      );
      var sortStudentsButton = new qx.ui.menu.Button(
        "Sort Students",
        "icon/16/actions/view-sort-ascending.png"
      );
      var validateDataButton = new qx.ui.menu.Button(
        "Validate Data",
        "icon/16/actions/dialog-ok-apply.png"
      );
      var backupDataButton = new qx.ui.menu.Button(
        "Backup Data",
        "icon/16/actions/document-save.png"
      );
      var restoreDataButton = new qx.ui.menu.Button(
        "Restore Data",
        "icon/16/actions/document-open.png"
      );
      var settingsButton = new qx.ui.menu.Button(
        "Settings",
        "icon/16/apps/preferences-system.png"
      );

      searchStudentButton.addListener("execute", () => {
        this.debug("Execute button: " + searchStudentButton.getLabel());
      }, this);
      filterStudentsButton.addListener("execute", () => {
        this.debug("Execute button: " + filterStudentsButton.getLabel());
      }, this);
      sortStudentsButton.addListener("execute", () => {
        this.debug("Execute button: " + sortStudentsButton.getLabel());
      }, this);
      validateDataButton.addListener("execute", () => {
        this.debug("Execute button: " + validateDataButton.getLabel());
      }, this);
      backupDataButton.addListener("execute", () => {
        this.debug("Execute button: " + backupDataButton.getLabel());
      }, this);
      restoreDataButton.addListener("execute", () => {
        this.debug("Execute button: " + restoreDataButton.getLabel());
      }, this);
      settingsButton.addListener("execute", () => {
        this.debug("Execute button: " + settingsButton.getLabel());
      }, this);

      menu.add(searchStudentButton);
      menu.add(filterStudentsButton);
      menu.add(sortStudentsButton);
      menu.addSeparator();
      menu.add(validateDataButton);
      menu.add(backupDataButton);
      menu.add(restoreDataButton);
      menu.addSeparator();
      menu.add(settingsButton);

      return menu;
    },

    _getHelpMenu : function()
    {
      var menu = new qx.ui.menu.Menu();

      var userGuideButton = new qx.ui.menu.Button(
        "User Guide",
        "icon/16/apps/utilities-help.png"
      );
      var quickStartButton = new qx.ui.menu.Button("Quick Start");
      var keyboardShortcutsButton = new qx.ui.menu.Button("Keyboard Shortcuts");
      var aboutButton = new qx.ui.menu.Button(
        "About Student Registration System",
        "icon/16/apps/utilities-help.png"
      );

      userGuideButton.addListener("execute", () => {
        this.debug("Execute button: " + userGuideButton.getLabel());
      }, this);
      quickStartButton.addListener("execute", () => {
        this.debug("Execute button: " + quickStartButton.getLabel());
      }, this);
      keyboardShortcutsButton.addListener("execute", () => {
        this.debug("Execute button: " + keyboardShortcutsButton.getLabel());
      }, this);
      aboutButton.addListener("execute", () => {
        this.debug("Execute button: " + aboutButton.getLabel());
      }, this);

      menu.add(userGuideButton);
      menu.add(quickStartButton);
      menu.add(keyboardShortcutsButton);
      menu.addSeparator();
      menu.add(aboutButton);

      return menu;
    }
  },

  /*
   *****************************************************************************
      DESTRUCT
   *****************************************************************************
   */

  destruct : function()
  {
    this._disposeObjects(
      "_newCommand",
      "_openCommand",
      "_saveCommand",
      "_undoCommand",
      "_redoCommand",
      "_cutCommand",
      "_copyCommand",
      "_pasteCommand"
    );
  }
});
