// @ts-nocheck
/* ************************************************************************

   Copyright: 2026

   License: MIT license

   Authors:

************************************************************************ */

/**
 * Basecoat-style Popover component using qooxdoo Popup behavior.
 * Trigger click (pointerdown) toggles popup reliably inside qx windows.
 */
qx.Class.define("qooxdo_proj.components.ui.Popover", {
  extend: qx.ui.core.Widget,

  properties: {
    triggerLabel: {
      check: "String",
      init: "Open popover",
      apply: "_applyTriggerLabel",
      event: "changeTriggerLabel"
    },
    title: {
      check: "String",
      init: "",
      apply: "_applyTitle",
      event: "changeTitle"
    },
    description: {
      check: "String",
      init: "",
      apply: "_applyDescription",
      event: "changeDescription"
    },
    popoverWidth: {
      check: "String",
      init: "w-80",
      apply: "_applyPopoverSizing"
    },
    size: {
      check: ["sm", "md", "lg", "xl", "custom"],
      init: "md",
      apply: "_applyPopoverSizing"
    },
    popoverMaxWidth: {
      check: "String",
      init: "",
      apply: "_applyPopoverSizing"
    },
    richSectionContent: {
      check: "Boolean",
      init: false
    }
  },

  events: {
    open: "qx.event.type.Event",
    close: "qx.event.type.Event"
  },

  construct(triggerLabel = "Open popover", title = "", description = "") {
    this.base(arguments);
    this._setLayout(new qx.ui.layout.Canvas());

    this._popoverId = "popover-" + qx.core.Id.getInstance().toHashCode(this);
    this._triggerId = this._popoverId + "-trigger";
    this._panelId = this._popoverId + "-panel";
    this._pendingSectionContent = "";

    const triggerEsc = this._escapeHtml(triggerLabel);
    const titleEsc = this._escapeHtml(title);
    const descEsc = this._escapeHtml(description);

    this._triggerHtml = new qx.ui.embed.Html(`
      <div class="qx-popover-trigger" style="display:inline-block;">
        <button id="${this._triggerId}" type="button" class="btn-outline" aria-expanded="false">
          ${triggerEsc}
        </button>
      </div>
    `);
    this._add(this._triggerHtml, { edge: 0 });

    this._panelHtml = new qx.ui.embed.Html(`
      <div id="${this._panelId}" aria-hidden="true" class="qx-popover-panel"
        style="background:var(--popover); color:var(--popover-foreground); border:1px solid var(--border); border-radius:var(--radius); padding:0.75rem; box-shadow: var(--shadow-lg); width:320px; max-width:320px; min-width:320px; box-sizing:border-box; overflow:hidden;">
        <div style="display:block; width:100%; box-sizing:border-box;">
          <div style="display:block; margin-bottom:0.75rem;">
            <h4 class="font-medium popover-title" style="margin:0 0 0.375rem 0; font-weight:600; line-height:1.5; white-space:normal; word-break:break-word; overflow-wrap:break-word; width:100%; max-width:100%; display:block;">${titleEsc}</h4>
            <p class="text-muted-foreground popover-description" style="margin:0; font-size:0.875rem; color:var(--muted-foreground); line-height:1.5; white-space:normal; word-break:break-word; overflow-wrap:break-word; width:100%; max-width:100%; display:block;">${descEsc}</p>
          </div>
          <div class="popover-section-content" style="display:block; width:100%; max-width:100%; white-space:normal; word-break:break-word; overflow-wrap:break-word; line-height:1.5; box-sizing:border-box;"></div>
        </div>
      </div>
    `);
    this._panelHtml.setAllowGrowX(true);
    this._panelHtml.setAllowGrowY(true);

    this._popup = new qx.ui.popup.Popup(new qx.ui.layout.Grow()).set({
      autoHide: true,
      keepActive: true,
      offset: 8,
      position: "bottom-left"
    });
    this._popup.add(this._panelHtml);

    this._popup.addListener("appear", () => {
      this._syncAria(true);
      this.fireEvent("open");
    }, this);
    this._popup.addListener("disappear", () => {
      this._syncAria(false);
      this.fireEvent("close");
    }, this);

    // Toggle once on pointerdown (matching qooxdoo popup demo behavior).
    // Do NOT also bind click, otherwise one pointer interaction can toggle twice.
    this._triggerHtml.addListener("pointerdown", (e) => {
      if (e.stopPropagation) e.stopPropagation();
      this.toggle(e);
    }, this);

    this._triggerHtml.addListenerOnce("appear", () => {
      this._applyTriggerLabel(this.getTriggerLabel());
      this._applyTitle(this.getTitle());
      this._applyDescription(this.getDescription());
      this._applyPopoverSizing();
    });

    // Ensure content/props are applied once popup DOM is mounted.
    this._panelHtml.addListener("appear", () => {
      this._applyTitle(this.getTitle());
      this._applyDescription(this.getDescription());
      this._applyPopoverSizing();
      this._renderSectionContent();
      // Patch qooxdoo's own wrapper div so it doesn't clip the panel
      const wrapperDom = this._panelHtml.getContentElement
        ? this._panelHtml.getContentElement().getDomElement()
        : null;
      if (wrapperDom) {
        wrapperDom.style.overflow = "visible";
        wrapperDom.style.width = "320px";
        wrapperDom.style.maxWidth = "320px";
      }
    }, this);
  },

  members: {
    _triggerHtml: null,
    _panelHtml: null,
    _popup: null,
    _popoverId: null,
    _triggerId: null,
    _panelId: null,
    _pendingSectionContent: null,
    _mobileSidePadding: 12,
    _getViewportWidth() {
      return window.innerWidth || document.documentElement.clientWidth || 1200;
    },

    _getResponsivePopoverWidth(width) {
      const viewportWidth = this._getViewportWidth();
      const safeWidth = viewportWidth - (this._mobileSidePadding * 2);
      return Math.max(220, Math.min(width || 320, safeWidth));
    },


    _resolveWidthPx(widthClass) {
      const widthMap = {
        "w-64": 256,
        "w-72": 288,
        "w-80": 320,
        "w-96": 384
      };
      return widthMap[widthClass || "w-80"] || 320;
    },

    _resolvePopoverSizing() {
      const size = this.getSize ? this.getSize() : "md";
      const maxWidth = this.getPopoverMaxWidth ? this.getPopoverMaxWidth() : "";
      const popoverWidth = this.getPopoverWidth ? this.getPopoverWidth() : "w-80";
      const widthBySize = {
        sm: { className: "w-64", px: 256 },
        md: { className: "w-80", px: 320 },
        lg: { className: "w-96", px: 384 },
        xl: { className: "w-96", px: 448 }
      };

      if (size === "custom" || (maxWidth && maxWidth.trim() !== "")) {
        const raw = (maxWidth || "").trim();
        const px = raw.endsWith("px") ? parseInt(raw, 10) : null;
        return {
          className: popoverWidth || "w-80",
          px: px && !isNaN(px) ? px : this._resolveWidthPx(popoverWidth || "w-80"),
          maxWidth: raw || "min(24rem, calc(100vw - 1rem))"
        };
      }

      const preset = widthBySize[size] || widthBySize.md;
      return {
        className: preset.className,
        px: preset.px,
        maxWidth: "min(24rem, calc(100vw - 1rem))"
      };
    },

    _escapeHtml(text) {
      if (!text) return "";
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    },

    _getTriggerElement() {
      if (!this._triggerHtml || !this._triggerHtml.getContentElement()) return null;
      const host = this._triggerHtml.getContentElement().getDomElement();
      return host ? host.querySelector("#" + this._triggerId) : null;
    },

    _getPanelElement() {
      if (!this._panelHtml || !this._panelHtml.getContentElement()) return null;
      const host = this._panelHtml.getContentElement().getDomElement();
      return host ? host.querySelector("#" + this._panelId) : null;
    },

    _getSectionContentElement() {
      const panel = this._getPanelElement();
      return panel ? panel.querySelector(".popover-section-content") : null;
    },

    _syncAria(open) {
      const trigger = this._getTriggerElement();
      const panel = this._getPanelElement();
      if (trigger) trigger.setAttribute("aria-expanded", open ? "true" : "false");
      if (panel) panel.setAttribute("aria-hidden", open ? "false" : "true");
    },

    _applyTriggerLabel(value) {
      const trigger = this._getTriggerElement();
      if (trigger) trigger.textContent = value || "Open popover";
    },

    _applyTitle(value) {
      const panel = this._getPanelElement();
      if (!panel) return;
      const title = panel.querySelector(".popover-title");
      if (title) title.textContent = value || "";
      this._syncHeaderVisibility();
    },

    _applyDescription(value) {
      const panel = this._getPanelElement();
      if (!panel) return;
      const description = panel.querySelector(".popover-description");
      if (description) description.textContent = value || "";
      this._syncHeaderVisibility();
    },

    _syncHeaderVisibility() {
      const panel = this._getPanelElement();
      if (!panel) return;
      const header = panel.querySelector(".popover-header");
      if (!header) return;
      const hasTitle = ((this.getTitle && this.getTitle()) || "").trim() !== "";
      const hasDescription = ((this.getDescription && this.getDescription()) || "").trim() !== "";
      const showHeader = hasTitle || hasDescription;
      header.style.display = showHeader ? "block" : "none";
      header.style.marginBottom = showHeader ? "0.4rem" : "0";
    },

    _applyPopoverSizing() {
      const sizing = this._resolvePopoverSizing();
      const panel = this._getPanelElement();
      const widthPx = sizing.px || 320;
      if (panel) {
        panel.style.width = widthPx + "px";
        panel.style.minWidth = widthPx + "px";
        panel.style.maxWidth = widthPx + "px";
        panel.style.boxSizing = "border-box";
        panel.style.overflow = "hidden";
      }

      if (this._panelHtml) {
        this._panelHtml.setMinWidth(widthPx);
        this._panelHtml.setWidth(widthPx);
        this._panelHtml.setMinHeight(50);
        // Patch the qooxdoo wrapper div width too
        const wrapperDom = this._panelHtml.getContentElement
          ? this._panelHtml.getContentElement().getDomElement()
          : null;
        if (wrapperDom) {
          wrapperDom.style.overflow = "visible";
          wrapperDom.style.width = widthPx + "px";
          wrapperDom.style.maxWidth = widthPx + "px";
        }
      }

      // Also size the qx popup widget itself so qooxdoo doesn't clip inner HTML.
      if (this._popup) {
        this._popup.setMinWidth(widthPx);
        this._popup.setWidth(widthPx);
        this._popup.setMinHeight(50);
      }
    },

    _applyPopupContainerStyles() {
      if (!this._popup) return;
      const popupEl = this._popup.getContentElement && this._popup.getContentElement();
      const dom = popupEl && popupEl.getDomElement ? popupEl.getDomElement() : null;
      if (!dom) return;
      dom.style.overflow = "visible";
      dom.style.maxWidth = `calc(100vw - ${this._mobileSidePadding * 2}px)`;
      dom.style.maxHeight = "none";
      dom.style.height = "auto";
    },

    show(e) {
      if (!this._popup) return;
      if (this._popup.isVisible()) return;

      // Anchor to trigger widget for consistent placement (single-click behavior,
      // avoids pointer-based offsets that can render clipped/sideways in windows).
      if (this._popup.placeToWidget) {
        this._popup.placeToWidget(this._triggerHtml, true);
      }
      this._popup.show();
      this._applyPopupContainerStyles();
    },

    hide() {
      if (!this._popup) return;
      this._popup.hide();
    },

    toggle(e) {
      if (this.getOpen()) {
        this.hide();
      } else {
        this.show(e);
      }
    },

    getOpen() {
      return this._popup ? this._popup.isVisible() : false;
    },

    setSectionContent(html) {
      this._pendingSectionContent = html != null ? String(html) : "";
      this._renderSectionContent();
    },

    getSectionElement() {
      return this._getSectionContentElement();
    },

    _renderSectionContent() {
      const section = this._getSectionContentElement();
      if (!section) return;
      section.innerHTML = this.getRichSectionContent()
        ? (this._pendingSectionContent || "")
        : this._escapeHtml(this._pendingSectionContent || "");
    }
  },

  destruct() {
    this._disposeObjects("_popup", "_triggerHtml", "_panelHtml");
  }
});
