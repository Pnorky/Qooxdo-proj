qx.Class.define("qooxdo_proj.components.ui.Label", {
  extend: qx.ui.core.Widget,

  properties: {
    value: {
      check: "String",
      init: "",
      apply: "_applyValue",
      event: "changeValue"
    },
    rich: {
      check: "Boolean",
      init: false,
      apply: "_applyRich"
    },
    textAlign: {
      check: ["left", "center", "right", "justify"],
      init: "left",
      apply: "_applyTextAlign"
    },
    /** Font style for section headers: "bold", "italic", or null (does not conflict with theme font) */
    fontStyle: {
      check: ["bold", "italic"],
      nullable: true,
      init: null,
      apply: "_applyFontStyle",
      event: "changeFontStyle"
    }
  },

  events: {
    /** Fired when the label value changes */
    "changeValue": "qx.event.type.Data"
  },

  construct(value = "") {
    this.base(arguments);

    // Set a layout so children get measured and laid out
    this._setLayout(new qx.ui.layout.Canvas());

    // Store initial value (don't call setter yet as element isn't ready)
    this._initialValue = value;

    // Create HTML for Basecoat label - let Basecoat handle styling
    this._html = new qx.ui.embed.Html(`
      <div style="margin: 0; padding: 0; min-width: 0; flex-shrink: 1; display: inline-flex; align-items: center; height: 100%; max-width: 100%;">
        <label class="label" style="min-width: 0; white-space: normal; overflow-wrap: anywhere; display: inline-block; max-width: 100%;"></label>
      </div>
    `);

    // Add child with layout properties
    this._add(this._html, { edge: 0 });

    // Hook DOM updates after the element appears
    this._html.addListenerOnce("appear", () => {
      // Now apply properties via property system to sync state
      if (this._initialValue) {
        this.setValue(this._initialValue);
      }
      this._applyFontStyle(this.getFontStyle());
      this._applyTextAlign(this.getTextAlign());
    });
  },

  members: {
    _html: null,
    _labelElement: null,
    _initialValue: null,

    /**
     * Escape HTML to prevent XSS attacks when rich is false
     * @param {String} text - Text to escape
     * @return {String} Escaped text
     */
    _escapeHtml(text) {
      if (!text) return "";
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    },

    /**
     * Get the actual DOM label element
     * @return {Element|null} The label element or null if not available
     */
    _getLabelElement() {
      if (this._labelElement) {
        return this._labelElement;
      }
      
      if (this._html && this._html.getContentElement()) {
        const container = this._html.getContentElement().getDomElement();
        this._labelElement = container ? container.querySelector("label") : null;
        return this._labelElement;
      }
      
      return null;
    },

    /**
     * Apply value changes to the DOM label
     * @param {String} value - The new value
     */
    _applyValue(value) {
      const label = this._getLabelElement();
      if (label) {
        if (this.getRich()) {
          // For rich text, allow HTML
          label.innerHTML = value || "";
        } else {
          // For plain text, escape HTML
          label.textContent = value || "";
        }
      }
    },

    /**
     * Apply rich text setting
     * @param {Boolean} rich - Whether to allow HTML content
     */
    _applyRich(rich) {
      // Re-apply value to update HTML rendering
      // Get current text content from DOM (always read as textContent to get visible text)
      const label = this._getLabelElement();
      let currentValue = "";
      if (label) {
        // Always read as textContent to get the actual displayed text
        currentValue = label.textContent || "";
      } else {
        // DOM not ready yet, use initial value
        currentValue = this._initialValue || "";
      }
      // Re-apply with new rich setting
      this._applyValue(currentValue);
    },

    /**
     * Apply font style (bold/italic) for section headers
     * @param {String|null} fontStyle - "bold", "italic", or null
     */
    _applyFontStyle(fontStyle) {
      const label = this._getLabelElement();
      if (label) {
        if (fontStyle === "bold") {
          label.style.fontWeight = "bold";
          label.style.fontStyle = "";
        } else if (fontStyle === "italic") {
          label.style.fontStyle = "italic";
          label.style.fontWeight = "";
        } else {
          label.style.fontWeight = "";
          label.style.fontStyle = "";
        }
      }
    },

    /**
     * Apply text alignment
     * @param {String} align - Text alignment (left, center, right, justify)
     */
    _applyTextAlign(align) {
      const label = this._getLabelElement();
      if (label) {
        label.style.textAlign = align || "left";
      }
    },

    /**
     * Get the current value/text of the label
     * @return {String} The current value
     */
    getValue() {
      const label = this._getLabelElement();
      if (label) {
        return this.getRich() ? label.innerHTML : label.textContent;
      }
      // Return initial value if DOM element not ready yet
      return this._initialValue || "";
    }
  }
});
