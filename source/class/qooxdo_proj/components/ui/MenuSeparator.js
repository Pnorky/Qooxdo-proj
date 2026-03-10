/* ************************************************************************
   Basecoat-style separator for qx menus.
************************************************************************ */

qx.Class.define("qooxdo_proj.components.ui.MenuSeparator", {
  extend: qx.ui.menu.Separator,

  construct: function () {
    this.base(arguments);
    // Remove theme-provided inset separator visuals/margins.
    this.setDecorator(null);
    this.setMarginLeft(0);
    this.setMarginRight(0);
    this.setMarginTop(8);
    this.setMarginBottom(8);
    this.setHeight(2);
    this.setMinHeight(2);
    this.setMaxHeight(2);
    this.setAllowGrowX(true);
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

      // Menu popup uses 6px horizontal padding (calc(var(--spacing) * 1.5)).
      // Bleed exactly through that inset to get a full-width divider.
      const bleed = 6;

      element.style.setProperty("display", "block", "important");
      element.style.setProperty("margin-top", "0", "important");
      element.style.setProperty("margin-bottom", "0", "important");
      element.style.setProperty("margin-left", "0", "important");
      element.style.setProperty("margin-right", "0", "important");
      element.style.setProperty("padding", "0", "important");
      element.style.setProperty("background-image", "none", "important");
      element.style.setProperty("position", "relative", "important");
      element.style.setProperty("left", `-${bleed}px`, "important");
      element.style.setProperty("height", "2px", "important");
      element.style.setProperty("min-height", "2px", "important");
      element.style.setProperty("max-height", "2px", "important");
      element.style.setProperty("width", `calc(100% + ${bleed * 2}px)`, "important");
      element.style.setProperty("max-width", "none", "important");
      element.style.setProperty("box-sizing", "border-box", "important");
      element.style.setProperty("border", "none", "important");
      element.style.setProperty("border-top", "none", "important");
      element.style.setProperty("opacity", "1", "important");
      element.style.setProperty("visibility", "visible", "important");
      element.style.setProperty("background", "var(--border)", "important");
      element.style.setProperty("background-color", "var(--border)", "important");
      element.style.setProperty("box-shadow", "none", "important");
    }
  }
});
