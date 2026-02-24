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
    /** Toaster alignment: start | center | end */
    align: {
      check: ["start", "center", "end"],
      init: "end",
      apply: "_applyAlign"
    },

    /** Default auto-dismiss timeout (ms). 0 disables auto-dismiss by default. */
    defaultDuration: {
      check: "Number",
      init: 4000
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
      const detail = evt && evt.detail ? evt.detail : {};
      const config = detail.config || {};
      this.show(config);
    };

    document.addEventListener("basecoat:toast", this.__documentToastListener);
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

    /**
     * Show a toast.
     * @param {Map?} config
     * @return {String|null} toast id
     */
    show(config = {}) {
      const toaster = this._getToasterElement();
      if (!toaster) return null;

      const toastId = this._nextToastId();
      const category = String(config.category || "info").toLowerCase();
      const title = this._escapeHtml(String(config.title || "Notification"));
      const descRaw = config.description != null ? String(config.description) : "";
      const description = this.getRichDescription() ? descRaw : this._escapeHtml(descRaw);

      const action = config.action && typeof config.action === "object" ? config.action : null;
      const cancel = config.cancel && typeof config.cancel === "object" ? config.cancel : null;

      const actionLabel = action && action.label ? this._escapeHtml(String(action.label)) : "";
      const cancelLabel = cancel && cancel.label ? this._escapeHtml(String(cancel.label)) : "Dismiss";

      const actionHtml = actionLabel
        ? `<button type="button" class="btn" data-toast-action>${actionLabel}</button>`
        : "";
      const cancelHtml = cancel !== null
        ? `<button type="button" class="btn-outline" data-toast-cancel>${cancelLabel}</button>`
        : "";
      const footerHtml = actionHtml || cancelHtml ? `<footer>${actionHtml}${cancelHtml}</footer>` : "";

      const toast = document.createElement("div");
      toast.className = "toast";
      toast.id = toastId;
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-atomic", "true");
      toast.setAttribute("aria-hidden", "false");
      toast.setAttribute("data-category", category);
      toast.innerHTML = `
        <div class="toast-content">
          ${this._getCategoryIcon(category)}
          <section>
            <h2>${title}</h2>
            <p>${description}</p>
          </section>
          ${footerHtml}
        </div>
      `;

      toaster.insertBefore(toast, toaster.firstChild);

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
      document.removeEventListener("basecoat:toast", this.__documentToastListener);
      this.__documentToastListener = null;
    }
    this.__timers = null;
    this.__removeTimers = null;
  }
});
