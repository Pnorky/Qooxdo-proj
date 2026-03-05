/* ************************************************************************
   Basecoat-style separator for qx menus.
************************************************************************ */

qx.Class.define("qooxdo_proj.components.ui.MenuSeparator", {
  extend: qx.ui.menu.Separator,

  construct: function () {
    this.base(arguments);
    this.addListener("appear", this._applyStyles, this);
    this.addListener("changeVisibility", (e) => {
      if (e.getData() === "visible") {
        this._applyStyles();
      }
    }, this);
  },

  members: {
    _applyStyles: function () {
      const contentElement = this.getContentElement ? this.getContentElement() : null;
      const element = contentElement ? contentElement.getDomElement() : null;
      if (!element) return;

      element.style.setProperty("display", "block", "important");
      element.style.setProperty("margin-block", "8px", "important");
      // Extend through menu popup horizontal padding (1.5 spacing on each side).
      element.style.setProperty("margin-inline", "calc(var(--spacing) * -1.5)", "important");
      element.style.setProperty("padding", "0", "important");
      element.style.setProperty("height", "1px", "important");
      element.style.setProperty("min-height", "1px", "important");
      element.style.setProperty("width", "calc(100% + (var(--spacing) * 3))", "important");
      element.style.setProperty("max-width", "calc(100% + (var(--spacing) * 3))", "important");
      element.style.setProperty("border", "none", "important");
      element.style.setProperty("border-top", "none", "important");
      element.style.setProperty("background", "var(--border)", "important");
      element.style.setProperty("background-color", "var(--border)", "important");
      element.style.setProperty("box-shadow", "none", "important");

      // Hide framework-generated inner line fragments to avoid overlap artifacts.
      const innerNodes = element.querySelectorAll("*");
      innerNodes.forEach((node) => {
        node.style.setProperty("display", "none", "important");
      });
    }
  }
});
