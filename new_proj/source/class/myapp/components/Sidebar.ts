// @ts-nocheck
/* ************************************************************************
   Sidebar built with the custom Card component.
************************************************************************ */

qx.Class.define("myapp.components.Sidebar", {
  extend: qx.ui.container.Composite,

  properties: {
    collapsed: {
      check: "Boolean",
      init: false,
      apply: "_applyCollapsed",
      event: "changeCollapsed"
    },
    mobileMode: {
      check: "Boolean",
      init: false,
      apply: "_applyMobileMode"
    }
  },

  events: {
    /** Fires with window key (e.g. "personalInfo") */
    openWindowRequest: "qx.event.type.Data",
    toggleSidebarRequest: "qx.event.type.Event",
    toggleThemeRequest: "qx.event.type.Event",
    logoutRequest: "qx.event.type.Event"
  },

  construct: function () {
    this.base(arguments);

    this.setLayout(new qx.ui.layout.VBox(0));
    this.addListenerOnce("appear", () => {
      const el = this.getContentElement ? this.getContentElement() : null;
      const dom = el ? el.getDomElement() : null;
      if (!dom) return;
      dom.style.background = "var(--sidebar)";
      dom.style.borderRight = "1px solid var(--border)";
      dom.style.boxSizing = "border-box";
      dom.style.padding = "10px";
      dom.style.overflow = "hidden";
      dom.style.borderRadius = "0";
      dom.style.outline = "none";
      dom.style.boxShadow = "none";
    }, this);
    this._buildUi();
  },

  members: {
    _card: null,
    _sidebarNavHtml: null,
    _sidebarClickHandler: null,
    _expandedSubtitle: "Student registration",
    _expandedWidth: 300,
    _collapsedWidth: 72,
    /** True when sidebar is layered above main content (mobile off-canvas). */
    _mobileDrawerLayer: false,

    setExpandedWidth: function (width) {
      const nextWidth = Math.max(240, Math.round(Number(width) || this._expandedWidth));
      if (nextWidth === this._expandedWidth) return;
      this._expandedWidth = nextWidth;
      this._applyCollapsed(this.isCollapsed());
    },

    _buildUi: function () {
      this._card = new myapp.components.ui.Card("Menu", "Student registration", true);
      this._card.setFullWidth(true);
      this._card.addListenerOnce("appear", () => {
        const cardEl = this._card.getContentElement ? this._card.getContentElement().getDomElement() : null;
        if (!cardEl) return;
        // Use explicit card colors for the main Quick Access card surface.
        cardEl.style.background = "var(--card)";
        cardEl.style.color = "var(--card-foreground)";
        cardEl.style.borderColor = "var(--border)";
        cardEl.style.borderRadius = "0";
        cardEl.style.boxShadow = "none";
        cardEl.style.outline = "none";
      }, this);

      const section = this._card.getSection();
      section.setLayout(new qx.ui.layout.Grow());

      var Lsvg = function (name, size) {
        return myapp.util.Lucide.svgHtml(name, { size: size != null ? size : 17 });
      };

      // Basecoat-style sidebar markup embedded inside the card body.
      this._sidebarNavHtml = new qx.ui.embed.Html(`
        <aside class="qoox-sidebar" data-side="left" aria-hidden="false" style="position: static; display: block; overflow: hidden; border: 0; background: var(--card); background-color: var(--card); --sidebar: var(--card); --sidebar-foreground: var(--card-foreground); --sidebar-border: var(--border); --sidebar-accent: var(--muted); --sidebar-accent-foreground: var(--card-foreground);">
          <style>
            .qoox-sidebar .sidebar-toolbar {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 0.5rem;
              margin: 0 0 0.75rem 0;
              padding-bottom: 0.65rem;
              border-bottom: 1px solid var(--border);
            }
            .qoox-sidebar .sidebar-toolbar-label {
              font-size: 0.72rem;
              font-weight: 700;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              color: var(--muted-foreground);
              line-height: 1.2;
            }
            .qoox-sidebar .sidebar-toggle-row {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 0.5rem;
            }
            .qoox-sidebar .sidebar-toggle {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              width: 2rem;
              height: 2rem;
              border: 1px solid var(--border);
              border-radius: 0.375rem;
              background: var(--muted);
              color: var(--foreground);
              cursor: pointer;
              line-height: 0;
              padding: 0;
            }
            .qoox-sidebar .sidebar-toggle svg {
              width: 1rem;
              height: 1rem;
            }
            .qoox-sidebar nav,
            .qoox-sidebar nav section.scrollbar,
            .qoox-sidebar nav [role="group"],
            .qoox-sidebar nav ul,
            .qoox-sidebar nav li {
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
              transform: none !important;
            }
            .qoox-sidebar nav ul li > a,
            .qoox-sidebar nav ul li > details > summary {
              background: var(--card) !important;
              color: var(--card-foreground) !important;
              border: 1px solid var(--border) !important;
            }
            .qoox-sidebar .nav-icon {
              width: 1.15rem;
              height: 1.15rem;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              color: var(--muted-foreground);
            }
            .qoox-sidebar .nav-icon svg {
              width: 1.05rem;
              height: 1.05rem;
            }
            .qoox-sidebar nav ul li > a:hover,
            .qoox-sidebar nav ul li > details > summary:hover {
              background: var(--accent) !important;
              color: var(--accent-foreground) !important;
            }
            .qoox-sidebar nav ul li > a:hover .nav-icon,
            .qoox-sidebar nav ul li > details > summary:hover .nav-icon {
              color: inherit !important;
            }
            .qoox-sidebar nav h3 {
              color: var(--muted-foreground) !important;
              font-size: 0.72rem !important;
              font-weight: 700 !important;
              letter-spacing: 0.07em !important;
              text-transform: uppercase !important;
              margin: 1rem 0 0.45rem 0 !important;
            }
            .qoox-sidebar nav [role="group"]:first-of-type h3 {
              margin-top: 0 !important;
            }
            @media (min-width: 901px) {
              .qoox-sidebar nav h3 {
                font-size: 1.02rem !important;
                font-weight: 700 !important;
              }
              .qoox-sidebar nav ul li > a,
              .qoox-sidebar nav ul li > details > summary {
                display: flex !important;
                align-items: center !important;
                gap: 0.5rem !important;
                width: 100% !important;
                min-height: 2.7rem;
                font-size: 1.02rem !important;
                font-weight: 600 !important;
                padding: 0.58rem 0.9rem !important;
                border-radius: 0.5rem !important;
              }
              .qoox-sidebar .nav-icon {
                width: 1.25rem !important;
                height: 1.25rem !important;
                margin-right: 0.35rem !important;
              }
              .qoox-sidebar .nav-icon svg {
                width: 1.1rem !important;
                height: 1.1rem !important;
              }
            }
            .qoox-sidebar.is-collapsed .sidebar-toolbar-label {
              display: none !important;
            }
            .qoox-sidebar.is-collapsed .sidebar-toolbar {
              justify-content: center;
              border-bottom: 0;
              margin-bottom: 0.35rem;
              padding-bottom: 0;
            }
            .qoox-sidebar.is-collapsed nav h3,
            .qoox-sidebar.is-collapsed .nav-text {
              display: none !important;
            }
            .qoox-sidebar.is-collapsed nav ul li > a {
              justify-content: center !important;
              padding-inline: 0 !important;
            }
            .qoox-sidebar.is-collapsed .sidebar-toggle-row {
              justify-content: center;
            }
            .qoox-sidebar.is-mobile .sidebar-toggle-row {
              justify-content: flex-start;
            }
            .qoox-sidebar.is-drawer-layer {
              min-height: 100%;
              background: var(--card) !important;
              background-color: var(--card) !important;
            }
            .qoox-sidebar.is-drawer-layer nav {
              background: var(--card) !important;
              background-color: var(--card) !important;
            }
            .qoox-sidebar.is-drawer-layer nav section.scrollbar {
              max-height: calc(100vh - 100px) !important;
              background: var(--card) !important;
            }
            .qoox-sidebar.is-drawer-layer nav [role="group"] {
              background: transparent;
            }
            @media (max-width: 900px) {
              .qoox-sidebar nav section.scrollbar {
                max-height: calc(100vh - 96px) !important;
                height: auto !important;
                display: block !important;
                padding-right: 2px;
              }
              .qoox-sidebar.is-mobile nav [role="group"] {
                display: block !important;
              }
              .qoox-sidebar.is-mobile nav section.scrollbar > [role="group"]:last-of-type {
                margin-top: 0.25rem !important;
                padding-top: 0 !important;
              }
              .qoox-sidebar.is-mobile nav ul {
                display: block !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              .qoox-sidebar.is-mobile nav h3 {
                font-size: 0.95rem !important;
                font-weight: 700 !important;
                margin: 0.4rem 0 0.55rem 0 !important;
              }
              .qoox-sidebar.is-mobile nav li {
                display: block !important;
                margin-bottom: 0.45rem !important;
              }
              .qoox-sidebar nav ul li > a,
              .qoox-sidebar nav ul li > details > summary {
                display: flex !important;
                align-items: center !important;
                gap: 0.45rem !important;
                width: 100% !important;
                min-height: 2.45rem;
                font-size: 0.96rem !important;
                font-weight: 600 !important;
                padding: 0.5rem 0.8rem !important;
                border-radius: 0.5rem !important;
              }
              .qoox-sidebar.is-mobile .nav-icon {
                width: 1.25rem !important;
                height: 1.25rem !important;
                margin-right: 0.3rem !important;
              }
              .qoox-sidebar.is-mobile .nav-icon svg {
                width: 1.05rem !important;
                height: 1.05rem !important;
              }
              .qoox-sidebar.is-mobile .sidebar-toggle {
                width: 2.25rem;
                height: 2.25rem;
                font-size: 1.05rem;
              }
            }
          </style>
          <nav aria-label="Sidebar navigation" style="position: static; inset: auto; z-index: auto; width: 100%; background: var(--card); background-color: var(--card); border: 0; color: var(--card-foreground); box-shadow: none; outline: none; display: block;">
            <section class="scrollbar" style="max-height: calc(100vh - 170px); overflow-y: auto;">
              <div class="sidebar-toolbar">
                <span class="sidebar-toolbar-label">Navigate</span>
                <button class="sidebar-toggle" type="button" data-action="toggleSidebar" aria-label="Collapse sidebar" title="Collapse sidebar">
                  ${Lsvg("chevron-left", 16)}
                </button>
              </div>
              <div role="group" aria-labelledby="nav-student-records">
                <h3 id="nav-student-records">Student records</h3>
                <ul>
                  <li><a href="#" data-action="personalInfo"><span class="nav-icon" aria-hidden="true">${Lsvg("user", 17)}</span><span class="nav-text">Personal information</span></a></li>
                  <li><a href="#" data-action="contactInfo"><span class="nav-icon" aria-hidden="true">${Lsvg("mail", 17)}</span><span class="nav-text">Contact information</span></a></li>
                  <li><a href="#" data-action="academicInfo"><span class="nav-icon" aria-hidden="true">${Lsvg("book-text", 17)}</span><span class="nav-text">Academic information</span></a></li>
                  <li><a href="#" data-action="studentTable"><span class="nav-icon" aria-hidden="true">${Lsvg("table", 17)}</span><span class="nav-text">All students</span></a></li>
                </ul>
              </div>

              <div role="group" aria-labelledby="nav-demos">
                <h3 id="nav-demos">Demos</h3>
                <ul>
                  <li><a href="#" data-action="uiDemo"><span class="nav-icon" aria-hidden="true">${Lsvg("layout-grid", 17)}</span><span class="nav-text">UI components</span></a></li>
                  <li><a href="#" data-action="uiTabToastDemo"><span class="nav-icon" aria-hidden="true">${Lsvg("message-circle", 17)}</span><span class="nav-text">Tabs &amp; toasts</span></a></li>
                </ul>
              </div>

              <div role="group" aria-labelledby="nav-account">
                <h3 id="nav-account">Account</h3>
                <ul>
                  <li><a href="#" data-action="toggleTheme"><span class="nav-icon" aria-hidden="true">${Lsvg("moon", 17)}</span><span class="nav-text">Dark mode</span></a></li>
                  <li><a href="#" data-action="logout"><span class="nav-icon" aria-hidden="true">${Lsvg("log-out", 17)}</span><span class="nav-text">Log out</span></a></li>
                </ul>
              </div>
            </section>
          </nav>
        </aside>
      `);
      section.add(this._sidebarNavHtml);

      this._sidebarNavHtml.addListenerOnce("appear", () => {
        const host = this._sidebarNavHtml.getContentElement
          ? this._sidebarNavHtml.getContentElement().getDomElement()
          : null;
        if (!host) return;

        this._sidebarClickHandler = (ev) => {
          const target = ev.target;
          const link = target && target.closest ? target.closest("[data-action]") : null;
          if (!link) return;
          ev.preventDefault();

          const action = link.getAttribute("data-action");
          if (!action) return;

          if (action === "toggleSidebar") {
            if (this.isMobileMode()) {
              this.fireEvent("toggleSidebarRequest");
            } else {
              this.setCollapsed(!this.isCollapsed());
            }
            return;
          }
          if (action === "toggleTheme") {
            this.fireEvent("toggleThemeRequest");
            return;
          }
          if (action === "logout") {
            this.fireEvent("logoutRequest");
            return;
          }

          this.fireDataEvent("openWindowRequest", action);
        };

        host.addEventListener("click", this._sidebarClickHandler);
      }, this);

      this.add(this._card, { flex: 1 });
      this._applyCollapsed(this.isCollapsed());
    },

    _applyCollapsed: function (collapsed) {
      if (this.isMobileMode() && !this._mobileDrawerLayer) {
        this.setWidth(this._expandedWidth);
        this.setMinWidth(this._expandedWidth);
        this.resetMaxWidth();
        this.setAllowGrowX(true);
        this.setAllowShrinkX(true);
      } else if (this.isMobileMode() && this._mobileDrawerLayer) {
        this.setAllowGrowX(false);
        this.setAllowShrinkX(false);
      } else {
        this.setWidth(collapsed ? this._collapsedWidth : this._expandedWidth);
        this.setMinWidth(collapsed ? this._collapsedWidth : this._expandedWidth);
        this.resetMaxWidth();
      }

      if (this._card) {
        const hideLabels = collapsed && !this.isMobileMode();
        this._card.setTitle(hideLabels ? "" : "Menu");
        this._card.setSubtitle(hideLabels ? "" : this._expandedSubtitle);
      }

      if (!this._sidebarNavHtml || !this._sidebarNavHtml.getContentElement) return;
      const host = this._sidebarNavHtml.getContentElement().getDomElement();
      if (!host) return;
      const aside = host.querySelector(".qoox-sidebar");
      if (!aside) return;
      aside.classList.toggle("is-collapsed", !!collapsed);

      const toggleBtn = host.querySelector(".sidebar-toggle");
      if (toggleBtn) {
        const chevronLeft = myapp.util.Lucide.svgHtml("chevron-left", { size: 16 });
        const chevronRight = myapp.util.Lucide.svgHtml("chevron-right", { size: 16 });
        toggleBtn.innerHTML = collapsed ? chevronRight : chevronLeft;
        toggleBtn.setAttribute("aria-label", collapsed ? "Expand sidebar" : "Collapse sidebar");
        toggleBtn.setAttribute("title", collapsed ? "Expand sidebar" : "Collapse sidebar");
      }
    },

    _applyMobileMode: function (mobileMode) {
      if (mobileMode && this.isCollapsed()) {
        this.setCollapsed(false);
      }
      this._applyCollapsed(this.isCollapsed());

      if (!this._sidebarNavHtml || !this._sidebarNavHtml.getContentElement) return;
      const host = this._sidebarNavHtml.getContentElement().getDomElement();
      if (!host) return;
      const aside = host.querySelector(".qoox-sidebar");
      if (!aside) return;
      aside.classList.toggle("is-mobile", !!mobileMode);
    },

    getDrawerWidth: function () {
      return this._expandedWidth;
    },

    setMobileDrawerLayerActive: function (active) {
      this._mobileDrawerLayer = !!active;
      const root = this.getContentElement ? this.getContentElement().getDomElement() : null;
      if (root) {
        if (!active) {
          root.style.transform = "";
          root.style.transition = "";
          root.style.willChange = "";
          root.style.boxShadow = "";
          root.style.zIndex = "";
          root.style.pointerEvents = "";
          root.style.backgroundColor = "";
          root.style.background = "";
          root.style.minHeight = "";
          root.style.height = "";
          this._clearDrawerPanelOpaqueFill();
        } else {
          root.style.zIndex = "3";
          root.style.transition = "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)";
          root.style.willChange = "transform";
          root.style.boxShadow = "8px 0 28px rgba(0,0,0,0.18)";
          root.style.backgroundColor = "var(--card)";
          root.style.background = "var(--card)";
          root.style.minHeight = "100%";
          root.style.height = "100%";
        }
      }
      if (!this._sidebarNavHtml || !this._sidebarNavHtml.getContentElement) return;
      const host = this._sidebarNavHtml.getContentElement().getDomElement();
      if (!host) return;
      const aside = host.querySelector(".qoox-sidebar");
      if (aside) aside.classList.toggle("is-drawer-layer", !!active);

      if (active) {
        qx.event.Timer.once(() => {
          this._syncDrawerPanelOpaqueFill();
        }, this, 0);
      }
    },

    _syncDrawerPanelOpaqueFill: function () {
      if (!this._mobileDrawerLayer) return;
      if (this._card) {
        const cardDom = this._card.getContentElement ? this._card.getContentElement().getDomElement() : null;
        if (cardDom) {
          cardDom.style.minHeight = "100%";
          cardDom.style.backgroundColor = "var(--card)";
        }
        const section = this._card.getSection ? this._card.getSection() : null;
        const secDom = section && section.getContentElement ? section.getContentElement().getDomElement() : null;
        if (secDom) {
          secDom.style.flexGrow = "1";
          secDom.style.backgroundColor = "var(--card)";
        }
      }
      if (this._sidebarNavHtml && this._sidebarNavHtml.getContentElement) {
        const htmlHost = this._sidebarNavHtml.getContentElement().getDomElement();
        if (htmlHost) {
          htmlHost.style.minHeight = "100%";
          htmlHost.style.backgroundColor = "var(--card)";
        }
      }
    },

    _clearDrawerPanelOpaqueFill: function () {
      if (this._card) {
        const cardDom = this._card.getContentElement ? this._card.getContentElement().getDomElement() : null;
        if (cardDom) {
          cardDom.style.minHeight = "";
          cardDom.style.backgroundColor = "";
        }
        const section = this._card.getSection ? this._card.getSection() : null;
        const secDom = section && section.getContentElement ? section.getContentElement().getDomElement() : null;
        if (secDom) {
          secDom.style.flexGrow = "";
          secDom.style.backgroundColor = "";
        }
      }
      if (this._sidebarNavHtml && this._sidebarNavHtml.getContentElement) {
        const htmlHost = this._sidebarNavHtml.getContentElement().getDomElement();
        if (htmlHost) {
          htmlHost.style.minHeight = "";
          htmlHost.style.backgroundColor = "";
        }
      }
    },

    setMobileDrawerOpen: function (open) {
      if (!this._mobileDrawerLayer || !this.isMobileMode()) return;
      const root = this.getContentElement ? this.getContentElement().getDomElement() : null;
      if (!root) return;
      root.style.transform = open ? "translateX(0)" : "translateX(-105%)";
      root.style.pointerEvents = open ? "auto" : "none";
    },

    refreshLayoutAfterDesktopRestore: function () {
      this._applyCollapsed(this.isCollapsed());
    },

    /**
     * Updates the subtitle text (e.g. show logged in user).
     * @param {String} subtitle
     */
    setSidebarSubtitle: function (subtitle) {
      this._expandedSubtitle = String(subtitle || "");
      if (this._card) {
        this._card.setSubtitle(this.isCollapsed() ? "" : this._expandedSubtitle);
      }
    }
  },

  destruct: function () {
    if (this._sidebarNavHtml && this._sidebarClickHandler && this._sidebarNavHtml.getContentElement) {
      const host = this._sidebarNavHtml.getContentElement().getDomElement();
      if (host) {
        host.removeEventListener("click", this._sidebarClickHandler);
      }
    }
  }
});

