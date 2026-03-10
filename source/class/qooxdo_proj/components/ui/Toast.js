/* ************************************************************************

   Copyright: 2026

   License: MIT license

   Authors:

************************************************************************ */

/**
 * Basecoat-style toast/toaster component.
 *
 * Usage:
 *   const toaster = new qooxdo_proj.components.ui.Toast();
 *   this.getRoot().add(toaster, { edge: 0 });
 *   toaster.show({
 *     category: "success",
 *     title: "Success",
 *     description: "Saved successfully.",
 *     cancel: { label: "Dismiss" }
 *   });
 *
 * Also listens for:
 *   document.dispatchEvent(new CustomEvent("basecoat:toast", { detail: { config: {...} } }))
 */
qx.Class.define("qooxdo_proj.components.ui.Toast", {
  extend: qx.ui.core.Widget,

  properties: {
    /** Toast placement preset */
    placement: {
      check: ["top-start", "top-center", "top-end", "bottom-start", "bottom-center", "bottom-end", "custom"],
      init: "top-end",
      apply: "_applyPlacement"
    },
    /** Toaster alignment: start | center | end */
    align: {
      check: ["start", "center", "end"],
      init: "end",
      apply: "_applyAlign"
    },
    /** Horizontal offset in pixels from edge/center anchor */
    offsetX: {
      check: "Number",
      init: 16,
      apply: "_applyPlacement"
    },
    /** Vertical offset in pixels from top/bottom edge */
    offsetY: {
      check: "Number",
      init: 16,
      apply: "_applyPlacement"
    },

    /** Default auto-dismiss timeout (ms). 0 disables auto-dismiss by default. */
    defaultDuration: {
      check: "Number",
      init: 4000
    },
    /** Maximum number of visible toasts at once; 0 means unlimited. */
    stackLimit: {
      check: "Number",
      init: 5
    },

    /** If true, description allows raw HTML; otherwise it is escaped. */
    richDescription: {
      check: "Boolean",
      init: false
    }
  },

  events: {
    /** Fired when a toast is shown; data is toast id */
    show: "qx.event.type.Data",
    /** Fired when a toast is removed; data is toast id */
    hide: "qx.event.type.Data"
  },

  construct() {
    this.base(arguments);
    this._setLayout(new qx.ui.layout.Canvas());

    this.__toasterId = "toaster-" + qx.core.Id.getInstance().toHashCode(this);
    this.__timers = {};
    this.__removeTimers = {};

    this._html = new qx.ui.embed.Html(`
      <div id="${this.__toasterId}" class="toaster" data-align="${this.getAlign()}"></div>
    `);
    this._add(this._html, { edge: 0 });

    this.__documentToastListener = (evt) => {
      if (this.isDisposed()) return;
      // Stop Basecoat's own native handler from also firing (it errors when
      // the toaster is inside a qooxdoo widget tree rather than bare HTML).
      evt.stopImmediatePropagation();
      const detail = evt && evt.detail ? evt.detail : {};
      const config = detail.config || {};
      this.show(config);
    };

    // Use capture phase so our handler runs before Basecoat's bubble-phase handler
    document.addEventListener("basecoat:toast", this.__documentToastListener, true);
  },

  members: {
    _html: null,
    __toasterId: null,
    __timers: null,
    __removeTimers: null,
    __documentToastListener: null,
    __idSeq: 0,

    _escapeHtml(text) {
      if (!text) return "";
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    },

    _getToasterElement() {
      if (!this._html || !this._html.getContentElement()) return null;
      const host = this._html.getContentElement().getDomElement();
      return host ? host.querySelector("#" + this.__toasterId) : null;
    },

    _applyAlign(value) {
      const toaster = this._getToasterElement();
      if (toaster) toaster.setAttribute("data-align", value || "end");
      // Keep backward compatibility for existing setAlign callers.
      this._applyPlacement(this.getPlacement());
    },

    _applyPlacement(value) {
      const toaster = this._getToasterElement();
      if (!toaster) return;

      const placement = value || "top-end";
      const offsetX = this.getOffsetX ? this.getOffsetX() : 16;
      const offsetY = this.getOffsetY ? this.getOffsetY() : 16;
      const align = this.getAlign ? this.getAlign() : "end";

      toaster.style.position = "fixed";
      toaster.style.zIndex = "10000";
      toaster.style.left = "";
      toaster.style.right = "";
      toaster.style.top = "";
      toaster.style.bottom = "";
      toaster.style.transform = "";

      if (placement !== "custom") {
        const [vertical, horizontal] = placement.split("-");
        if (vertical === "bottom") {
          toaster.style.bottom = `${offsetY}px`;
        } else {
          toaster.style.top = `${offsetY}px`;
        }

        if (horizontal === "start") {
          toaster.style.left = `${offsetX}px`;
        } else if (horizontal === "center") {
          toaster.style.left = "50%";
          toaster.style.transform = "translateX(-50%)";
        } else {
          toaster.style.right = `${offsetX}px`;
        }
        toaster.setAttribute("data-align", horizontal || align);
      } else {
        // Custom placement uses legacy align + top offset defaults.
        toaster.style.top = `${offsetY}px`;
        if (align === "start") {
          toaster.style.left = `${offsetX}px`;
        } else if (align === "center") {
          toaster.style.left = "50%";
          toaster.style.transform = "translateX(-50%)";
        } else {
          toaster.style.right = `${offsetX}px`;
        }
      }
    },

    _getCategoryIcon(category) {
      const c = (category || "").toLowerCase();
      if (c === "success") {
        return '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>';
      }
      if (c === "error" || c === "destructive" || c === "danger") {
        return '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>';
      }
      if (c === "warning") {
        return '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>';
      }
      // info/default
      return '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>';
    },

    _nextToastId() {
      this.__idSeq += 1;
      return this.__toasterId + "-toast-" + this.__idSeq;
    },

    _clearToastTimers(toastId) {
      if (this.__timers[toastId]) {
        clearTimeout(this.__timers[toastId]);
        delete this.__timers[toastId];
      }
      if (this.__removeTimers[toastId]) {
        clearTimeout(this.__removeTimers[toastId]);
        delete this.__removeTimers[toastId];
      }
    },

    _enforceStackLimit() {
      const limit = this.getStackLimit ? this.getStackLimit() : 0;
      if (!limit || limit <= 0) return;
      const toaster = this._getToasterElement();
      if (!toaster) return;

      const visibleToasts = Array.from(toaster.querySelectorAll(".toast"));
      if (visibleToasts.length <= limit) return;

      // Newest toast is inserted first; remove oldest extras at the end.
      const toRemove = visibleToasts.slice(limit);
      toRemove.forEach((node) => {
        const id = node.id;
        if (id) {
          this._clearToastTimers(id);
        }
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
        if (id) {
          this.fireDataEvent("hide", id);
        }
      });
    },

    /**
     * Show a toast.
     * @param {Map?} config
     * @return {String|null} toast id
     */
    show(config = {}) {
      // Wait for the toaster element to be available if not yet in DOM
      const tryShow = () => {
        const toaster = this._getToasterElement();
        if (!toaster) {
          // Retry after a short delay if element not ready
          if (!this.__toasterReady) {
            this.__toasterReady = true;
            setTimeout(() => tryShow(), 100);
          }
          return null;
        }

        const toastId = this._nextToastId();
        const category = String(config.category || "info").toLowerCase();
        const title = this._escapeHtml(String(config.title || "Notification"));
        const descRaw = config.description != null ? String(config.description) : "";
        const description = this.getRichDescription() ? descRaw : this._escapeHtml(descRaw);

        const action = config.action && typeof config.action === "object" ? config.action : null;
        const cancel = config.cancel && typeof config.cancel === "object" ? config.cancel : null;

        const actionLabel = action && action.label ? this._escapeHtml(String(action.label)) : "";
        const cancelLabel = cancel && cancel.label ? this._escapeHtml(String(cancel.label)) : "Dismiss";

        const toast = document.createElement("div");
        toast.className = "toast";
        toast.id = toastId;
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-atomic", "true");
        toast.setAttribute("aria-hidden", "false");
        toast.setAttribute("data-category", category);

        // Build toast HTML with proper styling matching basecoat Button component
        const actionHtml = actionLabel
          ? `<button type="button" class="btn btn-sm" data-toast-action>${actionLabel}</button>`
          : "";
        const cancelHtml = cancel !== null
          ? `<button type="button" class="btn btn-sm" data-toast-cancel style="background: var(--secondary); color: var(--secondary-foreground); border: 1px solid var(--border); white-space: nowrap;">${cancelLabel}</button>`
          : "";
        const footerHtml = actionHtml || cancelHtml ? `<footer style="display: flex; gap: 8px; margin-top: 12px;">${actionHtml}${cancelHtml}</footer>` : "";

        toast.innerHTML = `
          <div class="toast-content" style="display: flex; gap: 12px; align-items: flex-start;">
            <div style="flex-shrink: 0;">${this._getCategoryIcon(category)}</div>
            <section style="flex: 1; min-width: 0;">
              <h2 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">${title}</h2>
              <p style="margin: 0; font-size: 14px; color: var(--muted-foreground);">${description}</p>
            </section>
            ${footerHtml}
          </div>
        `;

        toaster.insertBefore(toast, toaster.firstChild);
        this._enforceStackLimit();

        const actionBtn = toast.querySelector("[data-toast-action]");
        if (actionBtn) {
          actionBtn.addEventListener("click", () => {
            if (typeof action.onClick === "function") {
              action.onClick({ id: toastId, toast, category });
            }
            this.dismiss(toastId);
          });
        }

        const cancelBtn = toast.querySelector("[data-toast-cancel]");
        if (cancelBtn) {
          cancelBtn.addEventListener("click", () => {
            this.dismiss(toastId);
          });
        }

        const duration = typeof config.duration === "number" ? config.duration : this.getDefaultDuration();
        if (duration > 0) {
          this.__timers[toastId] = setTimeout(() => this.dismiss(toastId), duration);
        }

        this.fireDataEvent("show", toastId);
        return toastId;
      };

      return tryShow();
    },

    /**
     * Alias for show(config).
     * @param {Map?} config
     * @return {String|null}
     */
    toast(config = {}) {
      return this.show(config);
    },

    /**
     * Dismiss toast by id.
     * @param {String} toastId
     */
    dismiss(toastId) {
      const toaster = this._getToasterElement();
      if (!toaster || !toastId) return;
      const toast = toaster.querySelector("#" + toastId);
      if (!toast) return;

      this._clearToastTimers(toastId);

      toast.setAttribute("aria-hidden", "true");
      this.__removeTimers[toastId] = setTimeout(() => {
        if (toast && toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
        delete this.__removeTimers[toastId];
        this.fireDataEvent("hide", toastId);
      }, 320);
    },

    /**
     * Remove all toasts immediately.
     */
    clear() {
      const toaster = this._getToasterElement();
      if (!toaster) return;

      const ids = Object.keys(this.__timers).concat(Object.keys(this.__removeTimers));
      ids.forEach(id => this._clearToastTimers(id));

      toaster.querySelectorAll(".toast").forEach(node => {
        if (node.parentNode) node.parentNode.removeChild(node);
      });
    }
  },

  destruct() {
    this.clear();
    if (this.__documentToastListener) {
      document.removeEventListener("basecoat:toast", this.__documentToastListener, true);
      this.__documentToastListener = null;
    }
    this.__timers = null;
    this.__removeTimers = null;
  }
});
