qx.Class.define("qooxdo_proj.components.ui.PasswordField", {
  extend: qx.ui.core.Widget,

  properties: {
    value: {
      check: "String",
      init: "",
      apply: "_applyValue",
      event: "changeValue"
    },
    placeholder: {
      check: "String",
      init: "",
      apply: "_applyPlaceholder"
    },
    enabled: {
      refine: true
    }
  },

  events: {
    /** Fired when the input value changes */
    "changeValue": "qx.event.type.Data",
    /** Fired when the user types in the field */
    "input": "qx.event.type.Data"
  },

  construct(placeholder = "") {
    this.base(arguments);

    // Set a layout so children get measured and laid out
    this._setLayout(new qx.ui.layout.Canvas());

    // Store initial values (don't call setters yet as element isn't ready)
    this._initialPlaceholder = placeholder;

    // Generate unique name for the input element
    this._inputName = `input-${qx.core.Id.getInstance().toHashCode(this)}`;

    // Create HTML with Basecoat class and minimal custom styling
    this._html = new qx.ui.embed.Html(`
      <div style="margin: 0; padding: 0; min-width: 0; flex-shrink: 1;">
        <style>
          input[name="${this._inputName}"] {
            box-shadow: none;
          }
          input[name="${this._inputName}"]:focus {
            border-color: #4688d1;
          }
        </style>
        <input 
          name="${this._inputName}" 
          class="input" 
          type="password" 
          placeholder="${placeholder || ""}"
        >
      </div>
    `);

    // Add child with layout properties
    this._add(this._html, { edge: 0 });

    // Listen to enabled property changes
    this.addListener("changeEnabled", (e) => {
      this._applyEnabled(e.getData());
    }, this);

    // Hook DOM events after the element appears
    this._html.addListenerOnce("appear", () => {
      this._setupInputEvents();
      // Now apply properties via property system to sync state
      if (this._initialPlaceholder) {
        this.setPlaceholder(this._initialPlaceholder);
      }
      // Apply initial enabled state
      this._applyEnabled(this.getEnabled());
    });
  },

  members: {
    _html: null,
    _inputName: null,
    _inputElement: null,
    _initialPlaceholder: null,

    /**
     * Setup event listeners on the input element
     */
    _setupInputEvents() {
      const container = this._html.getContentElement().getDomElement();
      this._inputElement = container.querySelector("input");
      
      if (!this._inputElement) {
        return;
      }

      // Listen to input events (fires on every keystroke)
      this._inputElement.addEventListener("input", (e) => {
        const value = e.target.value;
        // Update property (qooxdoo will skip apply if value hasn't changed)
        this.setValue(value);
        this.fireDataEvent("input", value);
      });

      // Listen to change events (fires on blur if value changed)
      this._inputElement.addEventListener("change", (e) => {
        const value = e.target.value;
        // Update property (qooxdoo will skip apply if value hasn't changed)
        this.setValue(value);
        this.fireDataEvent("changeValue", value);
      });
    },

    /**
     * Get the actual DOM input element
     * @return {Element|null} The input element or null if not available
     */
    _getInputElement() {
      if (this._inputElement) {
        return this._inputElement;
      }
      
      if (this._html && this._html.getContentElement()) {
        const container = this._html.getContentElement().getDomElement();
        this._inputElement = container ? container.querySelector("input") : null;
        return this._inputElement;
      }
      
      return null;
    },

    /**
     * Apply value changes to the DOM input
     * @param {String} value - The new value
     * @param {Boolean} oldValue - The old value
     */
    _applyValue(value, oldValue) {
      const input = this._getInputElement();
      if (input && input.value !== value) {
        input.value = value || "";
      }
    },

    /**
     * Apply placeholder changes to the DOM input
     * @param {String} placeholder - The new placeholder
     */
    _applyPlaceholder(placeholder) {
      const input = this._getInputElement();
      if (input) {
        input.placeholder = placeholder || "";
      } else {
        // Element not ready yet, store for later
        this._initialPlaceholder = placeholder;
      }
    },

    /**
     * Apply enabled state changes to the DOM input
     * @param {Boolean} enabled - Whether the field is enabled
     */
    _applyEnabled(enabled) {
      const input = this._getInputElement();
      if (input) {
        input.disabled = !enabled;
      }
    },

    /**
     * Get the current value from the input field
     * @return {String} The current value
     */
    getValue() {
      const input = this._getInputElement();
      return input ? input.value : this.getProperty("value") || "";
    },

    /**
     * Set focus on the input field
     */
    focus() {
      const input = this._getInputElement();
      if (input) {
        input.focus();
      }
    },

    /**
     * Remove focus from the input field
     */
    blur() {
      const input = this._getInputElement();
      if (input) {
        input.blur();
      }
    }
  }
});
