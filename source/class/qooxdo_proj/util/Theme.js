/* ************************************************************************

   Copyright: 2026 

   License: MIT license

   Authors: 

************************************************************************ */

qx.Class.define("qooxdo_proj.util.Theme", {
  type: "static",

  statics: {
    /**
     * Apply theme background color to a widget
     * @param {qx.ui.core.Widget} widget - The widget to style
     * @param {String} variant - Theme variant: "background", "card", "muted", etc.
     */
    applyBackground(widget, variant = "background") {
      const colorVar = `var(--${variant})`;
      // Qooxdoo doesn't accept CSS variables, so use DOM manipulation
      const applyStyle = () => {
        const contentElement = widget.getContentElement();
        if (contentElement) {
          const element = contentElement.getDomElement();
          if (element) {
            element.style.backgroundColor = colorVar;
          }
        }
      };
      
      // Try to apply immediately if widget is already visible
      if (widget.isVisible()) {
        applyStyle();
      } else {
        // Otherwise wait for appear event
        widget.addListenerOnce("appear", applyStyle, widget);
      }
    },

    /**
     * Apply theme text color to a widget
     * @param {qx.ui.core.Widget} widget - The widget to style
     * @param {String} variant - Theme variant: "foreground", "muted-foreground", etc.
     */
    applyForeground(widget, variant = "foreground") {
      const colorVar = `var(--${variant})`;
      // Qooxdoo doesn't accept CSS variables, so use DOM manipulation
      const applyStyle = () => {
        const contentElement = widget.getContentElement();
        if (contentElement) {
          const element = contentElement.getDomElement();
          if (element) {
            element.style.color = colorVar;
          }
        }
      };
      
      // Try to apply immediately if widget is already visible
      if (widget.isVisible()) {
        applyStyle();
      } else {
        // Otherwise wait for appear event
        widget.addListenerOnce("appear", applyStyle, widget);
      }
    },

    /**
     * Apply theme border color to a widget using decorator
     * @param {qx.ui.core.Widget} widget - The widget to style
     */
    applyBorder(widget) {
      const colorVar = "var(--border)";
      try {
        widget.setDecorator(new qx.ui.decoration.Decorator().set({
          width: 1,
          color: colorVar
        }));
      } catch (e) {
        // If decorator fails, try setting border via DOM
        widget.addListenerOnce("appear", () => {
          const domElement = widget.getContentElement();
          if (domElement) {
            const element = domElement.getDomElement();
            if (element) {
              element.style.borderColor = colorVar;
              element.style.borderWidth = "1px";
              element.style.borderStyle = "solid";
            }
          }
        }, this);
      }
    },

    /**
     * Get CSS custom property value
     * @param {String} propertyName - Name of the CSS variable (without --)
     * @return {String} The CSS variable value
     */
    getCSSVariable(propertyName) {
      return `var(--${propertyName})`;
    },

    /**
     * Apply theme styles to a container
     * @param {qx.ui.container.Composite} container - Container to style
     * @param {Object} options - Styling options
     */
    styleContainer(container, options = {}) {
      const {
        background = "card",
        foreground = "card-foreground",
        border = false,
        padding = null
      } = options;

      this.applyBackground(container, background);
      this.applyForeground(container, foreground);
      
      if (border) {
        this.applyBorder(container);
      }
      
      if (padding !== null) {
        container.setPadding(padding);
      }
    },

    /**
     * Apply theme styles to DOM element directly
     * @param {Element} element - DOM element to style
     * @param {Object} options - Styling options
     */
    styleDOMElement(element, options = {}) {
      const {
        background = null,
        foreground = null,
        border = false
      } = options;

      if (background) {
        element.style.backgroundColor = `var(--${background})`;
      }
      
      if (foreground) {
        element.style.color = `var(--${foreground})`;
      }
      
      if (border) {
        element.style.borderColor = "var(--border)";
        element.style.borderWidth = "1px";
        element.style.borderStyle = "solid";
      }
    }
  }
});
