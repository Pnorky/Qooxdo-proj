// @ts-nocheck
/* ************************************************************************

   Copyright: 2026 

   License: MIT license

   Authors: 

************************************************************************ */

qx.Class.define("myapp.components.Windows.UIDemoWindow", {
  extend: qx.ui.window.Window,

  construct: function () {
    this.base(arguments, "UI Component Samples");

    this.setLayout(new qx.ui.layout.VBox(10));
    this.setWidth(650);
    this.setHeight(420);
    this.setAllowClose(true);
    this.setAllowMaximize(false);
    this.setAllowMinimize(true);
    this.setResizable(true);
    this.setMovable(true);
    this.addListener("appear", this._applyResponsiveWindowSize, this);
    this.addListener("resize", this._applyResponsiveWindowSize, this);

    // create demo tab and add it to the window
    this._demoTab = new myapp.components.Tabs.UISampleTab();
    this.add(this._demoTab, { flex: 1 });
  },

  members: {
    _demoTab: null,
    _mobileBreakpoint: 900,

    _applyResponsiveWindowSize: function () {
      const width = window.innerWidth || 1200;
      const height = window.innerHeight || 800;
      if (width > this._mobileBreakpoint) return;

      this.setWidth(Math.max(300, Math.min(680, width - 24)));
      this.setHeight(Math.max(360, Math.min(720, height - 80)));
    },

    /**
     * Return underlying demo tab component
     * @return {myapp.components.Tabs.UISampleTab|null}
     */
    getDemoTab: function () {
      return this._demoTab;
    }
  }
});
