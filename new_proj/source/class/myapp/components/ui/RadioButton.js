/* ************************************************************************

   Project: myapp
   Component: RadioButton (basecoat-style)

   Copyright: 2026

   License: MIT

   Basecoat HTML equivalent:
   <fieldset class="grid gap-3">
     <label class="label"><input type="radio" name="radio-group" value="default" class="input">Default</label>
     <label class="label"><input type="radio" name="radio-group" value="comfortable" class="input" checked>Comfortable</label>
     <label class="label"><input type="radio" name="radio-group" value="compact" class="input">Compact</label>
   </fieldset>

************************************************************************ */
qx.Class.define("myapp.components.ui.RadioButton", {
    extend: qx.ui.core.Widget,
    properties: {
        /** Radio button label text */
        label: {
            check: "String",
            init: "",
            apply: "_applyLabel"
        },
        /** Radio button value */
        value: {
            check: "String",
            init: "",
            apply: "_applyValue"
        },
        /** Whether the radio button is checked */
        checked: {
            check: "Boolean",
            init: false,
            apply: "_applyChecked",
            event: "changeChecked"
        },
        /** Radio group name (for grouping radio buttons) */
        groupName: {
            check: "String",
            init: "radio-group",
            apply: "_applyGroupName"
        }
    },
    construct(label = "") {
        this.base(arguments);
        this._setLayout(new qx.ui.layout.HBox(8).set({ alignY: "middle" }));
        // Allow the widget to grow horizontally
        this.setAllowGrowX(true);
        this.setMinWidth(0);
        // Create the HTML structure
        this._html = new qx.ui.embed.Html(`
      <label class="label" style="display: flex; align-items: center; gap: 8px; cursor: pointer; margin: 0; padding: 4px 0; min-width: 120px;">
        <input type="radio" class="input" style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--primary); flex-shrink: 0;">
        <span class="label-text" style="line-height: 1.2; white-space: nowrap; color: inherit; font-size: 14px; flex-shrink: 0; min-width: 80px;"></span>
      </label>
    `);
        this._add(this._html);
        // Set initial label
        if (label) {
            this.setLabel(label);
        }
        // Hook DOM updates after element appears
        this._html.addListenerOnce("appear", () => {
            this._initDOM();
        });
    },
    members: {
        _html: null,
        _inputElement: null,
        _labelTextElement: null,
        /**
         * Initialize DOM elements after appearing
         */
        _initDOM() {
            const dom = this._html.getContentElement().getDomElement();
            if (!dom)
                return;
            this._inputElement = dom.querySelector("input");
            this._labelTextElement = dom.querySelector(".label-text");
            // Apply initial values
            this._applyLabel(this.getLabel());
            this._applyValue(this.getValue());
            this._applyChecked(this.getChecked());
            this._applyGroupName(this.getGroupName());
            this._applyEnabled(this.getEnabled());
            // Add change event listener
            if (this._inputElement) {
                this._inputElement.addEventListener("change", (e) => {
                    this.setChecked(this._inputElement.checked);
                });
            }
            // Add click listener to the label
            dom.addEventListener("click", (e) => {
                if (this.getEnabled()) {
                    this.toggle();
                }
            });
        },
        /**
         * Toggle the radio button
         */
        toggle() {
            if (this.getEnabled() && !this.getChecked()) {
                this.setChecked(true);
            }
        },
        /**
         * Apply label
         */
        _applyLabel(label) {
            if (this._labelTextElement) {
                this._labelTextElement.textContent = label;
            }
        },
        /**
         * Apply value
         */
        _applyValue(value) {
            if (this._inputElement) {
                this._inputElement.value = value;
            }
        },
        /**
         * Apply checked state
         */
        _applyChecked(checked) {
            if (this._inputElement) {
                this._inputElement.checked = checked;
            }
        },
        /**
         * Apply group name
         */
        _applyGroupName(groupName) {
            if (this._inputElement) {
                this._inputElement.name = groupName;
            }
        },
        /**
         * Apply enabled state
         */
        _applyEnabled(enabled) {
            if (this._inputElement) {
                this._inputElement.disabled = !enabled;
            }
            const dom = this._html.getContentElement().getDomElement();
            if (dom) {
                dom.style.cursor = enabled ? "pointer" : "not-allowed";
                dom.style.opacity = enabled ? "1" : "0.5";
            }
        }
    }
});
/* ************************************************************************

   RadioButtonGroup - A group of radio buttons (basecoat-style)

   Basecoat HTML equivalent:
   <fieldset class="grid gap-3">
     <label class="label"><input type="radio" name="radio-group" value="default" class="input">Default</label>
     ...
   </fieldset>

************************************************************************ */
qx.Class.define("myapp.components.ui.RadioButtonGroup", {
    extend: qx.ui.core.Widget,
    properties: {
        /** Group name for all radio buttons */
        groupName: {
            check: "String",
            init: "radio-group",
            apply: "_applyGroupName"
        },
        /** Selected value */
        value: {
            check: "String",
            nullable: true,
            init: null,
            apply: "_applyValue",
            event: "changeValue"
        }
    },
    events: {
        /** Fired when selection changes. Data: {value: string, oldValue: string} */
        "changeSelection": "qx.event.type.Data"
    },
    construct() {
        this.base(arguments);
        this._setLayout(new qx.ui.layout.VBox(12).set({ alignX: "left" }));
        this._radioButtons = [];
        this._selectedButton = null;
    },
    members: {
        _radioButtons: null,
        _selectedButton: null,
        /**
         * Add a radio button to the group
         * @param {myapp.components.ui.RadioButton} radioButton
         */
        add(radioButton) {
            radioButton.setGroupName(this.getGroupName());
            radioButton.addListener("changeChecked", this._onRadioButtonChange, this);
            this._radioButtons.push(radioButton);
            this._add(radioButton, { flex: 1 });
        },
        /**
         * Handle radio button checked change
         */
        _onRadioButtonChange(e) {
            const radioButton = e.getTarget();
            if (radioButton.getChecked()) {
                const oldValue = this.getValue();
                this._selectedButton = radioButton;
                this.setValue(radioButton.getValue());
                // Uncheck other buttons
                this._radioButtons.forEach((btn) => {
                    if (btn !== radioButton) {
                        btn.setChecked(false);
                    }
                });
                this.fireDataEvent("changeSelection", {
                    value: radioButton.getValue(),
                    oldValue: oldValue
                });
            }
        },
        /**
         * Apply group name to all radio buttons
         */
        _applyGroupName(groupName) {
            this._radioButtons.forEach((btn) => {
                btn.setGroupName(groupName);
            });
        },
        /**
         * Apply value - select the radio button with matching value
         */
        _applyValue(value) {
            this._radioButtons.forEach((btn) => {
                if (btn.getValue() === value) {
                    btn.setChecked(true);
                    this._selectedButton = btn;
                }
                else {
                    btn.setChecked(false);
                }
            });
        },
        /**
         * Get all radio buttons
         * @return {Array}
         */
        getChildren() {
            return this._radioButtons;
        },
        /**
         * Clear selection
         */
        clearSelection() {
            this._radioButtons.forEach((btn) => {
                btn.setChecked(false);
            });
            this._selectedButton = null;
            this.setValue(null);
        }
    }
});
