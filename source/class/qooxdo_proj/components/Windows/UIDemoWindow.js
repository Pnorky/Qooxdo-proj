/* ************************************************************************

   Copyright: 2026 

   License: MIT license

   Authors: 

************************************************************************ */

qx.Class.define("qooxdo_proj.components.Windows.UIDemoWindow", {
  extend: qx.ui.window.Window,

  construct: function () {
    this.base(arguments, "UI Component Samples");

    this.setLayout(new qx.ui.layout.VBox(10));
    this.setWidth(650);
    this.setHeight(500);
    this.setAllowClose(true);
    this.setAllowMaximize(false);
    this.setAllowMinimize(true);
    this.setResizable(true);
    this.setMovable(true);

    // create demo tab and add it to the window
    this._demoTab = new qooxdo_proj.components.Tabs.UISampleTab();
    this.add(this._demoTab, { flex: 1 });
  },

  members: {
    _demoTab: null,

    /**
     * Return underlying demo tab component
     * @return {qooxdo_proj.components.Tabs.UISampleTab|null}
     */
    getDemoTab: function () {
      return this._demoTab;
    }
  }
});