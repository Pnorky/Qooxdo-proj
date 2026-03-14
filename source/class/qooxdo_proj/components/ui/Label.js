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
        fontStyle: {
            check: ["bold", "italic"],
            nullable: true,
            init: null,
            apply: "_applyFontStyle",
            event: "changeFontStyle"
        }
    },
    events: {
        "changeValue": "qx.event.type.Data"
    },
    construct(value = "") {
        this.base(arguments);
        this._setLayout(new qx.ui.layout.Canvas());
        this._initialValue = value;
        this._html = new qx.ui.embed.Html(`
      <div style="margin: 0; padding: 0; min-width: 0; flex-shrink: 1; display: inline-flex; align-items: center; height: 100%; max-width: 100%;">
        <label class="label" style="min-width: 0; white-space: normal; overflow-wrap: anywhere; display: inline-block; max-width: 100%;"></label>
      </div>
    `);
        this._add(this._html, { edge: 0 });
        this._html.addListenerOnce("appear", () => {
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
        _applyValue(value) {
            const label = this._getLabelElement();
            if (!label)
                return;
            if (this.getRich()) {
                label.innerHTML = value || "";
            }
            else {
                label.textContent = value || "";
            }
        },
        _applyRich(_rich) {
            const label = this._getLabelElement();
            let currentValue = "";
            if (label) {
                currentValue = label.textContent || "";
            }
            else {
                currentValue = this._initialValue || "";
            }
            this._applyValue(currentValue);
        },
        _applyFontStyle(fontStyle) {
            const label = this._getLabelElement();
            if (!label)
                return;
            if (fontStyle === "bold") {
                label.style.fontWeight = "bold";
                label.style.fontStyle = "";
            }
            else if (fontStyle === "italic") {
                label.style.fontStyle = "italic";
                label.style.fontWeight = "";
            }
            else {
                label.style.fontWeight = "";
                label.style.fontStyle = "";
            }
        },
        _applyTextAlign(align) {
            const label = this._getLabelElement();
            if (label) {
                label.style.textAlign = align || "left";
            }
        },
        getValue() {
            const label = this._getLabelElement();
            if (label) {
                return this.getRich() ? label.innerHTML : (label.textContent || "");
            }
            return this._initialValue || "";
        }
    }
});
