/* ************************************************************************

   Copyright: 2026

   License: MIT license

   Authors:

************************************************************************ */

/**
 * Basecoat-style CheckBox component.
 * Renders as: <label class="label gap-3"><input type="checkbox" class="input"> Label text</label>
 * API compatible with qx.ui.form.CheckBox: setLabel/getLabel, setValue/getValue, changeValue event.
 */
qx.Class.define("qooxdo_proj.components.ui.CheckBox", {
  extend: qx.ui.core.Widget,

  properties: {
    /** Checkbox label text (shown next to the input) */
    label: {
      check: "String",
      init: "",
      apply: "_applyLabel",
      event: "changeLabel"
    },
    /** Checked state */
    value: {
      check: "Boolean",
      init: false,
      apply: "_applyValue",
      event: "changeValue"
    }
  },

  events: {
    /** Fired when the checked state changes */
    "changeValue": "qx.event.type.Data"
  },

  construct(label = "") {
    (this as any).base(arguments);

    this._setLayout(new qx.ui.layout.Canvas());

    this._initialLabel = label;

    const labelEsc = this._escapeHtml(label || "");
    this._html = new qx.ui.embed.Html(`
      <label class="label gap-3" style="margin: 0; padding: 0; display: inline-flex; align-items: center; cursor: pointer; min-width: 0;">
        <input type="checkbox" class="input" style="margin: 0;">
        <span class="checkbox-label-text">${labelEsc}</span>
      </label>
    `);

    this._add(this._html, { edge: 0 });

    this._html.addListenerOnce("appear", () => {
      if (this._initialLabel) {
        this.setLabel(this._initialLabel);
      }
      this._applyValue(this.getValue());
      this._attachInputListener();
    });
  },

  members: {
    _html: null as any,
    _initialLabel: null as string | null,

    _escapeHtml(text: string | null | undefined): string {
      if (!text) return "";
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    },

    _getRootElement(): HTMLLabelElement | null {
      if (!this._html || !this._html.getContentElement()) return null;
      const dom = this._html.getContentElement().getDomElement() as HTMLElement | null;
      return dom ? dom.querySelector("label") : null;
    },

    _getInputElement(): HTMLInputElement | null {
      const root = this._getRootElement();
      return root ? root.querySelector('input[type="checkbox"]') : null;
    },

    _getLabelTextElement(): HTMLSpanElement | null {
      const root = this._getRootElement();
      return root ? root.querySelector(".checkbox-label-text") : null;
    },

    _attachInputListener(): void {
      const input = this._getInputElement();
      if (!input) return;
      input.addEventListener("change", () => {
        if (this.isDisposed()) return;
        this.setValue(input.checked);
      });
    },

    _applyLabel(value: string): void {
      const span = this._getLabelTextElement();
      if (span) {
        span.textContent = value || "";
      }
    },

    _applyValue(value: boolean): void {
      const input = this._getInputElement();
      if (input) {
        input.checked = !!value;
      }
    }
  }
});
