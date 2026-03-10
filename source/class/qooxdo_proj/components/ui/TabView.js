/* ************************************************************************

   Copyright: 2026

   License: MIT license

   Authors:

************************************************************************ */

/**
 * Basecoat-style TabView component.
 * Structure: div.tabs > nav[role=tablist] + panels[role=tabpanel].
 * Manage tabs via addTab/removeTab/setTabs and setActiveIndex.
 * Also supports qooxdoo-like pages: add(new qooxdo_proj.components.ui.TabPage(...)).
 */
qx.Class.define("qooxdo_proj.components.ui.TabView", {
  extend: qx.ui.core.Widget,

  properties: {
    /** If true, setTabContent accepts HTML; otherwise content is escaped */
    richContent: {
      check: "Boolean",
      init: false
    }
  },

  events: {
    /** Fired when selected tab index changes */
    changeSelection: "qx.event.type.Data"
  },

  construct() {
    this.base(arguments);

    this._setLayout(new qx.ui.layout.Canvas());

    this._tabsId = "tabs-" + qx.core.Id.getInstance().toHashCode(this);
    this._tabs = [];
    this._activeIndex = -1;

    this._html = new qx.ui.embed.Html(`
      <div class="tabs w-full" id="${this._tabsId}">
        <nav role="tablist" aria-orientation="horizontal" class="w-full tabs-nav" style="display:flex; flex-wrap:wrap; gap:0.375rem; overflow-x:auto; scrollbar-width:thin;"></nav>
        <div class="tabs-panels"></div>
      </div>
    `);

    this._add(this._html, { edge: 0 });

    this._html.addListenerOnce("appear", () => {
      this._attachEventDelegation();
      this._render();
    });
  },

  members: {
    _html: null,
    _tabsId: null,
    _tabs: null,
    _activeIndex: -1,

    _unbindPageListeners(tab) {
      if (!tab || !tab.page || !tab._pageListenerIds) return;
      tab._pageListenerIds.forEach(id => {
        if (id != null && tab.page.removeListenerById) {
          tab.page.removeListenerById(id);
        }
      });
      tab._pageListenerIds = null;
    },

    _indexOfPage(page) {
      for (let i = 0; i < this._tabs.length; i++) {
        if (this._tabs[i].page === page) return i;
      }
      return -1;
    },

    _bindPage(page) {
      const tab = {
        label: page.getLabel(),
        content: page.getContent(),
        richContent: page.getRichContent(),
        page,
        _pageListenerIds: []
      };

      tab._pageListenerIds.push(page.addListener("changeLabel", () => {
        const index = this._indexOfPage(page);
        if (index < 0) return;
        this._tabs[index].label = page.getLabel();
        this._render();
      }));

      tab._pageListenerIds.push(page.addListener("changeContent", () => {
        const index = this._indexOfPage(page);
        if (index < 0) return;
        this._tabs[index].content = page.getContent();
        this._render();
      }));

      tab._pageListenerIds.push(page.addListener("changeRichContent", () => {
        const index = this._indexOfPage(page);
        if (index < 0) return;
        this._tabs[index].richContent = page.getRichContent();
        this._render();
      }));

      return tab;
    },

    _escapeHtml(text) {
      if (!text) return "";
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    },

    _getRootElement() {
      if (!this._html || !this._html.getContentElement()) return null;
      const host = this._html.getContentElement().getDomElement();
      return host ? host.querySelector("#" + this._tabsId) : null;
    },

    _getNavElement() {
      const root = this._getRootElement();
      return root ? root.querySelector(".tabs-nav") : null;
    },

    _getPanelsElement() {
      const root = this._getRootElement();
      return root ? root.querySelector(".tabs-panels") : null;
    },

    _buildTabButton(tab, index) {
      const tabId = `${this._tabsId}-tab-${index + 1}`;
      const panelId = `${this._tabsId}-panel-${index + 1}`;
      const selected = index === this._activeIndex;
      const labelEsc = this._escapeHtml(tab.label || `Tab ${index + 1}`);

      return `
        <button
          type="button"
          role="tab"
          id="${tabId}"
          data-tab-index="${index}"
          aria-controls="${panelId}"
          aria-selected="${selected ? "true" : "false"}"
          tabindex="${selected ? "0" : "-1"}"
          style="min-height:2.35rem; padding:0.45rem 0.75rem; white-space:nowrap; flex-shrink:0;"
        >${labelEsc}</button>
      `;
    },

    _buildPanel(tab, index) {
      const tabId = `${this._tabsId}-tab-${index + 1}`;
      const panelId = `${this._tabsId}-panel-${index + 1}`;
      const selected = index === this._activeIndex;
      const content = (tab.richContent || this.getRichContent())
        ? (tab.content || "")
        : this._escapeHtml(tab.content || "");

      return `
        <div
          role="tabpanel"
          id="${panelId}"
          data-panel-index="${index}"
          aria-labelledby="${tabId}"
          tabindex="-1"
          aria-selected="${selected ? "true" : "false"}"
          ${selected ? "" : "hidden"}
        >${content}</div>
      `;
    },

    _render() {
      const nav = this._getNavElement();
      const panels = this._getPanelsElement();
      if (!nav || !panels) return;

      // keep a valid selected tab when tabs exist
      if (this._tabs.length === 0) {
        this._activeIndex = -1;
      } else if (this._activeIndex < 0 || this._activeIndex >= this._tabs.length) {
        this._activeIndex = 0;
      }

      nav.innerHTML = this._tabs.map((tab, i) => this._buildTabButton(tab, i)).join("");
      panels.innerHTML = this._tabs.map((tab, i) => this._buildPanel(tab, i)).join("");
    },

    _attachEventDelegation() {
      const root = this._getRootElement();
      if (!root) return;

      root.addEventListener("click", (e) => {
        const button = e.target.closest('button[role="tab"][data-tab-index]');
        if (!button) return;
        const index = parseInt(button.getAttribute("data-tab-index"), 10);
        if (!isNaN(index)) {
          this.setActiveIndex(index);
        }
      });

      // keyboard support for tab buttons
      root.addEventListener("keydown", (e) => {
        const target = e.target;
        if (!target || target.getAttribute("role") !== "tab") return;
        if (this._tabs.length === 0) return;

        let nextIndex = this._activeIndex;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          nextIndex = (this._activeIndex + 1) % this._tabs.length;
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          nextIndex = (this._activeIndex - 1 + this._tabs.length) % this._tabs.length;
        } else if (e.key === "Home") {
          nextIndex = 0;
        } else if (e.key === "End") {
          nextIndex = this._tabs.length - 1;
        } else {
          return;
        }

        e.preventDefault();
        this.setActiveIndex(nextIndex);
        const rootEl = this._getRootElement();
        if (!rootEl) return;
        const nextBtn = rootEl.querySelector(`button[role="tab"][data-tab-index="${nextIndex}"]`);
        if (nextBtn) nextBtn.focus();
      });
    },

    /**
     * Add a new tab.
     * @param {String} label - Tab button label
     * @param {String} content - Panel content (plain text by default)
     * @return {Number} New tab index
     */
    addTab(label, content = "") {
      this._tabs.push({ label: label || "", content: String(content || "") });
      if (this._activeIndex === -1) {
        this._activeIndex = 0;
      }
      this._render();
      return this._tabs.length - 1;
    },

    /**
     * Qooxdoo-like add() API:
     * - add(page: qooxdo_proj.components.ui.TabPage)
     * - add(label: String, content: String)
     * @param {qooxdo_proj.components.ui.TabPage|String} pageOrLabel
     * @param {String?} content
     * @return {Number} New tab index
     */
    add(pageOrLabel, content = "") {
      if (pageOrLabel instanceof qooxdo_proj.components.ui.TabPage) {
        return this.addPage(pageOrLabel);
      }
      return this.addTab(String(pageOrLabel || ""), content);
    },

    /**
     * Add a TabPage model object.
     * @param {qooxdo_proj.components.ui.TabPage} page
     * @return {Number} New tab index
     */
    addPage(page) {
      if (!(page instanceof qooxdo_proj.components.ui.TabPage)) {
        return -1;
      }
      const tab = this._bindPage(page);
      this._tabs.push(tab);
      if (this._activeIndex === -1) {
        this._activeIndex = 0;
      }
      this._render();
      return this._tabs.length - 1;
    },

    /**
     * Replace all tabs.
     * @param {Array<{label:String, content:String}>} tabs
     */
    setTabs(tabs) {
      this._tabs.forEach(tab => this._unbindPageListeners(tab));
      this._tabs = Array.isArray(tabs) ? tabs.map(tab => ({
        label: tab && tab.label != null ? String(tab.label) : "",
        content: tab && tab.content != null ? String(tab.content) : ""
      })) : [];
      this._activeIndex = this._tabs.length > 0 ? 0 : -1;
      this._render();
    },

    /**
     * Remove a tab by index.
     * @param {Number} index
     */
    removeTab(index) {
      if (index < 0 || index >= this._tabs.length) return;
      const removed = this._tabs.splice(index, 1)[0];
      this._unbindPageListeners(removed);

      if (this._tabs.length === 0) {
        this._activeIndex = -1;
      } else if (this._activeIndex >= this._tabs.length) {
        this._activeIndex = this._tabs.length - 1;
      }

      this._render();
    },

    /**
     * Qooxdoo-like remove() API:
     * - remove(index: Number)
     * - remove(page: qooxdo_proj.components.ui.TabPage)
     * @param {Number|qooxdo_proj.components.ui.TabPage} pageOrIndex
     */
    remove(pageOrIndex) {
      if (typeof pageOrIndex === "number") {
        this.removeTab(pageOrIndex);
        return;
      }
      if (pageOrIndex instanceof qooxdo_proj.components.ui.TabPage) {
        const index = this._indexOfPage(pageOrIndex);
        if (index >= 0) this.removeTab(index);
      }
    },

    /**
     * Remove all tabs.
     */
    clearTabs() {
      this._tabs.forEach(tab => this._unbindPageListeners(tab));
      this._tabs = [];
      this._activeIndex = -1;
      this._render();
    },

    /**
     * Set panel content for a tab.
     * @param {Number} index
     * @param {String} content
     */
    setTabContent(index, content) {
      if (index < 0 || index >= this._tabs.length) return;
      this._tabs[index].content = String(content || "");
      this._render();
    },

    /**
     * Set tab label.
     * @param {Number} index
     * @param {String} label
     */
    setTabLabel(index, label) {
      if (index < 0 || index >= this._tabs.length) return;
      this._tabs[index].label = String(label || "");
      this._render();
    },

    /**
     * Select active tab by index.
     * @param {Number} index
     */
    setActiveIndex(index) {
      if (index < 0 || index >= this._tabs.length) return;
      if (index === this._activeIndex) return;
      this._activeIndex = index;
      this._render();
      this.fireDataEvent("changeSelection", index);
    },

    /**
     * Get active tab index.
     * @return {Number}
     */
    getActiveIndex() {
      return this._activeIndex;
    },

    /**
     * Get number of tabs.
     * @return {Number}
     */
    getTabCount() {
      return this._tabs.length;
    },

    /**
     * Get added TabPage objects (tabs added with addPage/add(page)).
     * Tabs created via addTab/setTabs are not included.
     * @return {qooxdo_proj.components.ui.TabPage[]}
     */
    getPages() {
      return this._tabs.map(tab => tab.page).filter(Boolean);
    },

    /**
     * Get tab panel DOM element by index.
     * @param {Number} index
     * @return {Element|null}
     */
    getPanelElement(index) {
      const panels = this._getPanelsElement();
      if (!panels) return null;
      return panels.querySelector(`[data-panel-index="${index}"]`);
    }
  }
});
