/* ************************************************************************

   Copyright: 2026 

   License: MIT license

   Authors: 

************************************************************************ */

qx.Class.define("qooxdo_proj.components.Windows.ContactInfoWindow",
{
  extend : qx.ui.window.Window,

  construct : function()
  {
    this.base(arguments, "Contact Information");
    
    this.setLayout(new qx.ui.layout.VBox(10));
    this.setWidth(600);
    this.setHeight(500);
    this.setAllowClose(true);
    this.setAllowMaximize(false);
    this.setAllowMinimize(true);
    this.setResizable(true);
    this.setMovable(true);

    // Create the ContactInfoTab component
    this._contactInfoTab = new qooxdo_proj.components.Tabs.ContactInfoTab();
    
    // Add the tab page directly to the window (it's a container)
    this.add(this._contactInfoTab, { flex: 1 });
  },

  members :
  {
    _contactInfoTab : null,

    /**
     * Get the ContactInfoTab component
     * @return {qooxdo_proj.components.Tabs.ContactInfoTab} The contact info tab component
     */
    getContactInfoTab : function()
    {
      return this._contactInfoTab;
    },

    /**
     * Get form data
     * @return {Object} Form data
     */
    getData : function()
    {
      return this._contactInfoTab ? this._contactInfoTab.getData() : {};
    },

    /**
     * Validate form
     * @return {Object} Validation result
     */
    validate : function()
    {
      return this._contactInfoTab ? this._contactInfoTab.validate() : { valid: false, message: "Form not initialized" };
    },

    /**
     * Clear form
     */
    clear : function()
    {
      if (this._contactInfoTab) {
        this._contactInfoTab.clear();
      }
    }
  }
});
