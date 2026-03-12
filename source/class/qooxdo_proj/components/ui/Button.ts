type ToolTipSide = "top" | "bottom" | "left" | "right";
type ToolTipAlign = "start" | "center" | "end";
declare var qooxdo_proj: any;

qx.Class.define("qooxdo_proj.components.ui.Button", {
  extend: qx.ui.core.Widget,

  events: {
    "execute": "qx.event.type.Event"
  },

  construct(label: string, variant = "", size = "") {
    (this as any).base(arguments);
    this._label = String(label || "");

    // set a layout so children get measured and laid out
    this._setLayout(new qx.ui.layout.Canvas());

    // generate Basecoat classes
    let classes = ["btn"];
    if (variant) classes.push(`btn-${variant}`);
    if (size) classes.push(`btn-${size}`);

    // embed HTML
    // Use min-width: 0 to allow flex items to shrink below their content size
    // Add text overflow handling for long button text
    this._html = new qx.ui.embed.Html(`
      <div style="margin: 2px; min-width: 0; flex-shrink: 1;">
        <button class="${classes.join(" ")}" style="width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; min-width: 0;">${this._label}</button>
      </div>
    `);

    // add child with layout properties
    this._add(this._html, { edge: 0 });

    // hook DOM click
    this._html.addListenerOnce("appear", () => {
      const btn = this._html.getContentElement().getDomElement().querySelector("button") as HTMLButtonElement | null;
      if (!btn) return;
      this._buttonElement = btn;
      btn.addEventListener("click", () => this.fireEvent("execute"));
    });
  },

  members: {
    _label: "" as string,
    _buttonElement: null as HTMLButtonElement | null,
    _basecoatToolTip: null as any,

    setLabel(label: string): void {
      this._label = String(label || "");
      if (this._buttonElement) {
        this._buttonElement.textContent = this._label;
      }
    },

    getLabel(): string {
      return this._label || "";
    },

    /**
     * Convenience helper to attach/update a Basecoat tooltip.
     * @param {String} text Tooltip text
     * @param {"top"|"bottom"|"left"|"right"} side Tooltip side
     * @param {"start"|"center"|"end"} align Tooltip alignment
     * @return {qooxdo_proj.components.ui.Button} this
     */
    setBasecoatToolTip(text: string, side: ToolTipSide = "top", align: ToolTipAlign = "center"): any {
      if (!this._basecoatToolTip) {
        this._basecoatToolTip = new qooxdo_proj.components.ui.ToolTip(
          String(text || ""),
          side || "top",
          align || "center"
        );
        this._basecoatToolTip.attachTo(this);
      } else {
        this._basecoatToolTip.setText(String(text || ""));
        this._basecoatToolTip.setSide(side || "top");
        this._basecoatToolTip.setAlign(align || "center");
        this._basecoatToolTip.attachTo(this);
      }
      return this;
    },

    /**
     * Remove any tooltip attached via setBasecoatToolTip.
     * @return {qooxdo_proj.components.ui.Button} this
     */
    clearBasecoatToolTip(): any {
      if (!this._basecoatToolTip) return this;
      this._basecoatToolTip.detachFrom(this);
      this._basecoatToolTip.dispose();
      this._basecoatToolTip = null;
      return this;
    },

    /**
     * Get the tooltip instance attached via setBasecoatToolTip.
     * @return {qooxdo_proj.components.ui.ToolTip|null}
     */
    getBasecoatToolTip(): any {
      return this._basecoatToolTip || null;
    }
  },

  destruct() {
    this.clearBasecoatToolTip();
  }
});