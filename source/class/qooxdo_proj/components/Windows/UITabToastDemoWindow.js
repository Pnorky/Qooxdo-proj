/* ************************************************************************

   Copyright: 2026

   License: MIT license

   Authors:

************************************************************************ */

qx.Class.define("qooxdo_proj.components.Windows.UITabToastDemoWindow", {
  extend: qx.ui.window.Window,

  construct: function () {
    this.base(arguments, "TabView + Toast Samples");

    this.setLayout(new qx.ui.layout.VBox(10));
    this.setWidth(650);
    this.setHeight(500);
    this.setAllowClose(true);
    this.setAllowMaximize(false);
    this.setAllowMinimize(true);
    this.setResizable(true);
    this.setMovable(true);

    this._demoTab = new qooxdo_proj.components.Tabs.UITabToastSampleTab();
    this.add(this._demoTab, { flex: 1 });
  },

  members: {
    _demoTab: null,

    /**
     * Return underlying demo tab component
     * @return {qooxdo_proj.components.Tabs.UITabToastSampleTab|null}
     */
    getDemoTab: function () {
      return this._demoTab;
    }
  }
});
