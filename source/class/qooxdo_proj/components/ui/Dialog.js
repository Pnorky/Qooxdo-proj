/* ************************************************************************

   Copyright: 2026

   License: MIT license

   Authors:

************************************************************************ */

/**
 * Basecoat-style Dialog component using the native <dialog> element.
 * Structure: dialog > div > header (title, description), section (content), footer (Cancel/Save), close (X) button.
 * Use setTitle/setDescription, setSectionContent or getSectionElement(), show()/close(). Listen to "save" and "cancel".
 */
qx.Class.define("qooxdo_proj.components.ui.Dialog", {
  extend: qx.ui.core.Widget,

  properties: {
    /** Dialog title (header h2) */
    title: {
      check: "String",
      init: "",
      apply: "_applyTitle",
      event: "changeTitle"
    },
    /** Dialog description (header p) */
    description: {
      check: "String",
      init: "",
      apply: "_applyDescription",
      event: "changeDescription"
    },
    /** Cancel button label */
    cancelLabel: {
      check: "String",
      init: "Cancel",
      apply: "_applyCancelLabel"
    },
    /** Save/OK button label */
    saveLabel: {
      check: "String",
      init: "Save changes",
      apply: "_applySaveLabel"
    },
    /** Visual intent for save button: primary or destructive */
    saveIntent: {
      check: ["primary", "destructive"],
      init: "primary",
      apply: "_applySaveIntent"
    },
    /** If true, setSectionContent accepts HTML; otherwise content is escaped */
    richSectionContent: {
      check: "Boolean",
      init: false
    }
  },

  events: {
    /** Fired when the user clicks Save */
    "save": "qx.event.type.Event",
    /** Fired when the user clicks Cancel or closes the dialog */
    "cancel": "qx.event.type.Event"
  },

  construct(title = "", description = "") {
    this.base(arguments);

    this._setLayout(new qx.ui.layout.Canvas());

    this._dialogId = "dialog-" + qx.core.Id.getInstance().toHashCode(this);
    this._titleId = this._dialogId + "-title";
    this._descriptionId = this._dialogId + "-description";

    const titleEsc = this._escapeHtml(title || "");
    const descEsc = this._escapeHtml(description || "");

    this._html = new qx.ui.embed.Html(`
      <dialog id="${this._dialogId}" class="dialog w-full sm:max-w-[425px] max-h-[612px]" aria-labelledby="${this._titleId}" aria-describedby="${this._descriptionId}" style="margin: 0;">
        <div>
          <header>
            <h2 id="${this._titleId}">${titleEsc}</h2>
            <p id="${this._descriptionId}">${descEsc}</p>
          </header>
          <section>
            <div class="dialog-section-content"></div>
          </section>
          <footer>
            <button type="button" class="btn-outline dialog-cancel-btn">Cancel</button>
            <button type="button" class="btn dialog-save-btn">Save changes</button>
          </footer>
          <button type="button" class="dialog-close-btn" aria-label="Close dialog" style="position: absolute; top: 0; right: 0; margin: 0.5rem; padding: 0.25rem; background: transparent; border: none; cursor: pointer; color: inherit;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      </dialog>
    `);

    this._add(this._html, { edge: 0 });

    this._html.addListenerOnce("appear", () => {
      this._applyTitle(this.getTitle());
      this._applyDescription(this.getDescription());
      this._applyCancelLabel(this.getCancelLabel());
      this._applySaveLabel(this.getSaveLabel());
      this._applySaveIntent(this.getSaveIntent());
      this._attachListeners();
    });
  },

  members: {
    _html: null,
    _dialogId: null,
    _titleId: null,
    _descriptionId: null,
    __listenersAttached: false,
    __boundDialogElement: null,
    __pendingSectionContent: null,

    _escapeHtml(text) {
      if (!text) return "";
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    },

    _getDialogElement() {
      if (!this._html || !this._html.getContentElement()) return null;
      const root = this._html.getContentElement().getDomElement();
      return root ? root.querySelector("dialog") || root.firstElementChild : null;
    },

    _getSectionContentElement() {
      const dialog = this._getDialogElement();
      if (!dialog) return null;
      return dialog.querySelector(".dialog-section-content");
    },

    _attachListeners() {
      const dialog = this._getDialogElement();
      if (!dialog) return;
      if (this.__boundDialogElement === dialog) return;

      // Backdrop click: close when clicking the dialog itself
      dialog.addEventListener("click", (e) => {
        if (e.target === dialog) {
          dialog.close();
          this.fireEvent("cancel");
        }
      });

      // Close button (X)
      const closeBtn = dialog.querySelector(".dialog-close-btn");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          dialog.close();
          this.fireEvent("cancel");
        });
      }

      // Cancel button
      const cancelBtn = dialog.querySelector(".dialog-cancel-btn");
      if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
          dialog.close();
          this.fireEvent("cancel");
        });
      }

      // Save button
      const saveBtn = dialog.querySelector(".dialog-save-btn");
      if (saveBtn) {
        saveBtn.addEventListener("click", () => {
          this.fireEvent("save");
          dialog.close();
        });
      }

      this.__listenersAttached = true;
      this.__boundDialogElement = dialog;
    },

    _applyTitle(value) {
      const dialog = this._getDialogElement();
      if (!dialog) return;
      const h2 = dialog.querySelector("#" + this._titleId);
      if (h2) h2.textContent = value || "";
    },

    _applyDescription(value) {
      const dialog = this._getDialogElement();
      if (!dialog) return;
      const p = dialog.querySelector("#" + this._descriptionId);
      if (p) p.textContent = value || "";
    },

    _applyCancelLabel(value) {
      const dialog = this._getDialogElement();
      if (!dialog) return;
      const btn = dialog.querySelector(".dialog-cancel-btn");
      if (btn) btn.textContent = value || "Cancel";
    },

    _applySaveLabel(value) {
      const dialog = this._getDialogElement();
      if (!dialog) return;
      const btn = dialog.querySelector(".dialog-save-btn");
      if (btn) btn.textContent = value || "Save changes";
    },

    _applySaveIntent(value) {
      const dialog = this._getDialogElement();
      if (!dialog) return;
      const btn = dialog.querySelector(".dialog-save-btn");
      if (!btn) return;

      // Keep default "btn" style for primary actions.
      if ((value || "primary") === "destructive") {
        btn.style.background = "var(--destructive)";
        btn.style.color = "var(--destructive-foreground)";
        btn.style.borderColor = "var(--destructive)";
      } else {
        btn.style.background = "";
        btn.style.color = "";
        btn.style.borderColor = "";
      }
    },

    /**
     * Open the dialog (showModal).
     */
    show() {
      const tryShow = (retriesLeft = 10) => {
        const dialog = this._getDialogElement();
        if (!dialog) {
          if (retriesLeft > 0) {
            qx.event.Timer.once(() => tryShow(retriesLeft - 1), this, 25);
          }
          return;
        }

        // Ensure listeners and latest properties are wired before open.
        this._applyTitle(this.getTitle());
        this._applyDescription(this.getDescription());
        this._applyCancelLabel(this.getCancelLabel());
        this._applySaveLabel(this.getSaveLabel());
        this._applySaveIntent(this.getSaveIntent());
        this._attachListeners();

        // If section content was set before DOM was ready, apply it now.
        if (this.__pendingSectionContent != null) {
          this.setSectionContent(this.__pendingSectionContent);
        }

        if (typeof dialog.showModal === "function" && !dialog.open) {
          dialog.showModal();
        }
      };

      tryShow();
    },

    /**
     * Close the dialog.
     */
    close() {
      const dialog = this._getDialogElement();
      if (dialog && typeof dialog.close === "function") {
        dialog.close();
      }
    },

    /**
     * Set the section body HTML (e.g. form markup). Content is escaped if richSectionContent is false.
     * @param {String} html - HTML or plain text for the section.
     */
    setSectionContent(html) {
      const el = this._getSectionContentElement();
      if (el) {
        el.innerHTML = this.getRichSectionContent() ? (html || "") : this._escapeHtml(String(html || ""));
        this.__pendingSectionContent = null;
      } else {
        // Cache content for first render/open so it is not lost.
        this.__pendingSectionContent = html;
      }
    },

    /**
     * Get the section content DOM element so you can append nodes or set innerHTML.
     * @return {Element|null}
     */
    getSectionElement() {
      return this._getSectionContentElement();
    }
  }
  ,

  destruct() {
    this.__listenersAttached = false;
    this.__boundDialogElement = null;
    this.__pendingSectionContent = null;
  }
});
