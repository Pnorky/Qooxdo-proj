/* ************************************************************************

   Copyright: 2026

   License: MIT license

   Authors:

************************************************************************ */

/**
 * Basecoat-style Popover component.
 * Structure: div.popover > button (trigger) + div[data-popover] (panel with header + section content).
 * Trigger toggles panel visibility; aria-expanded and aria-hidden are kept in sync.
 * Use setTriggerLabel, setTitle/setDescription, setSectionContent or getSectionElement(), show()/hide()/toggle().
 */
qx.Class.define("qooxdo_proj.components.ui.Popover", {
  extend: qx.ui.core.Widget,

  properties: {
    /** Trigger button label */
    triggerLabel: {
      check: "String",
      init: "Open popover",
      apply: "_applyTriggerLabel",
      event: "changeTriggerLabel"
    },
    /** Popover panel title (header h4) */
    title: {
      check: "String",
      init: "",
      apply: "_applyTitle",
      event: "changeTitle"
    },
    /** Popover description (header p, text-muted) */
    description: {
      check: "String",
      init: "",
      apply: "_applyDescription",
      event: "changeDescription"
    },
    /** Width class for the panel (e.g. "w-80", "w-96"). Applied to the [data-popover] div. */
    popoverWidth: {
      check: "String",
      init: "w-80",
      apply: "_applyPopoverWidth"
    },
    /** If true, setSectionContent accepts HTML; otherwise content is escaped */
    richSectionContent: {
      check: "Boolean",
      init: false
    }
  },

  events: {
    /** Fired when the popover is shown */
    "open": "qx.event.type.Event",
    /** Fired when the popover is closed */
    "close": "qx.event.type.Event"
  },

  construct(triggerLabel = "Open popover", title = "", description = "") {
    this.base(arguments);

    this._setLayout(new qx.ui.layout.Canvas());

    this._popoverId = "popover-" + qx.core.Id.getInstance().toHashCode(this);
    this._triggerId = this._popoverId + "-trigger";
    this._panelId = this._popoverId + "-popover";

    const triggerEsc = this._escapeHtml(triggerLabel || "Open popover");
    const titleEsc = this._escapeHtml(title || "");
    const descEsc = this._escapeHtml(description || "");

    this._html = new qx.ui.embed.Html(`
      <div id="${this._popoverId}" class="popover" style="position: relative; display: inline-block;">
        <button id="${this._triggerId}" type="button" aria-expanded="false" aria-controls="${this._panelId}" class="btn-outline">${triggerEsc}</button>
        <div id="${this._panelId}" data-popover aria-hidden="true" class="w-80" style="display: none;">
          <div class="grid gap-4">
            <header class="grid gap-1.5 popover-header">
              <h4 class="leading-none font-medium popover-title">${titleEsc}</h4>
              <p class="text-muted-foreground text-sm popover-description">${descEsc}</p>
            </header>
            <div class="popover-section-content"></div>
          </div>
        </div>
      </div>
    `);

    this._add(this._html, { edge: 0 });

    this._html.addListenerOnce("appear", () => {
      this._applyTriggerLabel(this.getTriggerLabel());
      this._applyTitle(this.getTitle());
      this._applyDescription(this.getDescription());
      this._applyPopoverWidth(this.getPopoverWidth());
      this._attachListeners();
    });
  },

  members: {
    _html: null,
    _popoverId: null,
    _triggerId: null,
    _panelId: null,
    _outsideClickListener: null,

    _escapeHtml(text) {
      if (!text) return "";
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    },

    _getRootElement() {
      if (!this._html || !this._html.getContentElement()) return null;
      const root = this._html.getContentElement().getDomElement();
      return root ? root.querySelector(".popover") || root.firstElementChild : null;
    },

    _getTriggerElement() {
      const root = this._getRootElement();
      return root ? root.querySelector("#" + this._triggerId) : null;
    },

    _getPanelElement() {
      const root = this._getRootElement();
      return root ? root.querySelector("[data-popover]") : null;
    },

    _getSectionContentElement() {
      const root = this._getRootElement();
      return root ? root.querySelector(".popover-section-content") : null;
    },

    _attachListeners() {
      const trigger = this._getTriggerElement();
      const panel = this._getPanelElement();
      if (!trigger || !panel) return;

      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggle();
      });

      // Close when clicking outside (document click)
      this._outsideClickListener = (e) => {
        if (this.isDisposed() || !this.getOpen()) return;
        const root = this._getRootElement();
        if (root && !root.contains(e.target)) {
          this.hide();
        }
      };
    },

    _applyTriggerLabel(value) {
      const trigger = this._getTriggerElement();
      if (trigger) trigger.textContent = value || "Open popover";
    },

    _applyTitle(value) {
      const root = this._getRootElement();
      if (!root) return;
      const el = root.querySelector(".popover-title");
      if (el) el.textContent = value || "";
    },

    _applyDescription(value) {
      const root = this._getRootElement();
      if (!root) return;
      const el = root.querySelector(".popover-description");
      if (el) el.textContent = value || "";
    },

    _applyPopoverWidth(value) {
      const panel = this._getPanelElement();
      if (!panel) return;
      // Remove common width classes and add the new one
      panel.classList.remove("w-80", "w-96", "w-72", "w-64");
      if (value) panel.classList.add(value);
    },

    /**
     * Show the popover panel and update aria attributes.
     */
    show() {
      const trigger = this._getTriggerElement();
      const panel = this._getPanelElement();
      if (!trigger || !panel) return;

      panel.style.display = "block";
      panel.setAttribute("aria-hidden", "false");
      trigger.setAttribute("aria-expanded", "true");

      document.addEventListener("click", this._outsideClickListener, true);

      this.fireEvent("open");
    },

    /**
     * Hide the popover panel and update aria attributes.
     */
    hide() {
      const trigger = this._getTriggerElement();
      const panel = this._getPanelElement();
      if (!trigger || !panel) return;

      panel.style.display = "none";
      panel.setAttribute("aria-hidden", "true");
      trigger.setAttribute("aria-expanded", "false");

      document.removeEventListener("click", this._outsideClickListener, true);

      this.fireEvent("close");
    },

    /**
     * Toggle open/closed state.
     */
    toggle() {
      const panel = this._getPanelElement();
      if (!panel) return;
      const isHidden = panel.getAttribute("aria-hidden") === "true";
      if (isHidden) {
        this.show();
      } else {
        this.hide();
      }
    },

    /**
     * Whether the popover is currently open.
     * @return {Boolean}
     */
    getOpen() {
      const panel = this._getPanelElement();
      return panel ? panel.getAttribute("aria-hidden") === "false" : false;
    },

    /**
     * Set the section body HTML (e.g. form markup).
     * @param {String} html - HTML or plain text for the section.
     */
    setSectionContent(html) {
      const el = this._getSectionContentElement();
      if (el) {
        el.innerHTML = this.getRichSectionContent() ? (html || "") : this._escapeHtml(String(html || ""));
      }
    },

    /**
     * Get the section content DOM element for appending nodes or setting innerHTML.
     * @return {Element|null}
     */
    getSectionElement() {
      return this._getSectionContentElement();
    }
  },

  destruct() {
    if (this._outsideClickListener) {
      document.removeEventListener("click", this._outsideClickListener, true);
      this._outsideClickListener = null;
    }
    this.base(arguments);
  }
});
