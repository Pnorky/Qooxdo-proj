/* ************************************************************************

   Copyright: 2026 

   License: MIT license

   Authors: 

************************************************************************ */

qx.Class.define("qooxdo_proj.components.Windows.AcademicInfoWindow",
{
  extend : qx.ui.window.Window,

  construct : function()
  {
    this.base(arguments, "Academic Information");
    
    this.setLayout(new qx.ui.layout.VBox(10));
    this.setWidth(600);
    this.setHeight(500);
    this.setAllowClose(true);
    this.setAllowMaximize(false);
    this.setAllowMinimize(true);
    this.setResizable(true);
    this.setMovable(true);

    // Create the AcademicInfoTab component
    this._academicInfoTab = new qooxdo_proj.components.Tabs.AcademicInfoTab();
    
    // Add the tab page directly to the window (it's a container)
    this.add(this._academicInfoTab, { flex: 1 });
  },

  members :
  {
    _academicInfoTab : null,

    /**
     * Get the AcademicInfoTab component
     * @return {qooxdo_proj.components.Tabs.AcademicInfoTab} The academic info tab component
     */
    getAcademicInfoTab : function()
    {
      return this._academicInfoTab;
    },

    /**
     * Get form data
     * @return {Object} Form data
     */
    getData : function()
    {
      return this._academicInfoTab ? this._academicInfoTab.getData() : {};
    },

    /**
     * Validate form
     * @return {Object} Validation result
     */
    validate : function()
    {
      return this._academicInfoTab ? this._academicInfoTab.validate() : { valid: false, message: "Form not initialized" };
    },

    /**
     * Clear form
     */
    clear : function()
    {
      if (this._academicInfoTab) {
        this._academicInfoTab.clear();
      }
    }
  }
});
