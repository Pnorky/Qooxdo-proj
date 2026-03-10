/* ************************************************************************
   Sidebar built with the custom Card component.
************************************************************************ */

qx.Class.define("qooxdo_proj.components.Sidebar", {
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
    _expandedSubtitle: "Open forms and actions",
    _expandedWidth: 280,
    _collapsedWidth: 72,

    setExpandedWidth: function (width) {
      const nextWidth = Math.max(240, Math.round(Number(width) || this._expandedWidth));
      if (nextWidth === this._expandedWidth) return;
      this._expandedWidth = nextWidth;
      this._applyCollapsed(this.isCollapsed());
    },

    _buildUi: function () {
      this._card = new qooxdo_proj.components.ui.Card("Quick Access", "Open forms and actions", true);
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

      // Basecoat-style sidebar markup embedded inside the card body.
      this._sidebarNavHtml = new qx.ui.embed.Html(`
        <aside class="qoox-sidebar" data-side="left" aria-hidden="false" style="position: static; display: block; overflow: hidden; border: 0; --sidebar: var(--card); --sidebar-foreground: var(--card-foreground); --sidebar-border: var(--border); --sidebar-accent: var(--muted); --sidebar-accent-foreground: var(--card-foreground);">
          <style>
            .qoox-sidebar .sidebar-toggle-row {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 0.5rem;
            }
            .qoox-sidebar .sidebar-toggle {
              width: 2rem;
              height: 2rem;
              border: 1px solid var(--border);
              border-radius: 0.375rem;
              background: var(--card);
              color: var(--card-foreground);
              cursor: pointer;
              line-height: 1;
              font-size: 1rem;
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
              width: 1rem;
              display: inline-flex;
              justify-content: center;
              flex-shrink: 0;
            }
            .qoox-sidebar nav ul li > a:hover,
            .qoox-sidebar nav ul li > details > summary:hover {
              background: var(--accent) !important;
              color: var(--accent-foreground) !important;
            }
            .qoox-sidebar nav h3 {
              color: var(--muted-foreground) !important;
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
                width: 100% !important;
                min-height: 2.7rem;
                font-size: 1.02rem !important;
                font-weight: 600 !important;
                padding: 0.58rem 0.9rem !important;
                border-radius: 0.5rem !important;
              }
              .qoox-sidebar .nav-icon {
                width: 1.35rem !important;
                margin-right: 0.28rem !important;
                font-size: 1rem !important;
              }
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
                width: 100% !important;
                min-height: 2.45rem;
                font-size: 0.96rem !important;
                font-weight: 600 !important;
                padding: 0.5rem 0.8rem !important;
                border-radius: 0.5rem !important;
              }
              .qoox-sidebar.is-mobile .nav-icon {
                width: 1.35rem !important;
                margin-right: 0.25rem !important;
                font-size: 1rem !important;
              }
              .qoox-sidebar.is-mobile .sidebar-toggle {
                width: 2.25rem;
                height: 2.25rem;
                font-size: 1.05rem;
              }
            }
          </style>
          <nav aria-label="Sidebar navigation" style="position: static; inset: auto; z-index: auto; width: 100%; background: transparent; border: 0; color: var(--card-foreground); box-shadow: none; outline: none; display: block;">
            <section class="scrollbar" style="max-height: calc(100vh - 170px); overflow-y: auto;">
              <div class="sidebar-toggle-row">
                <button class="sidebar-toggle" type="button" data-action="toggleSidebar" aria-label="Toggle sidebar" title="Toggle sidebar">◀</button>
              </div>
              <div role="group" aria-labelledby="group-label-content-1">
                <h3 id="group-label-content-1">Getting started</h3>
                <ul>
                  <li><a href="#" data-action="personalInfo"><span class="nav-icon">P</span><span class="nav-text">Personal Information</span></a></li>
                  <li><a href="#" data-action="contactInfo"><span class="nav-icon">C</span><span class="nav-text">Contact Information</span></a></li>
                  <li><a href="#" data-action="academicInfo"><span class="nav-icon">A</span><span class="nav-text">Academic Information</span></a></li>
                  <li><a href="#" data-action="studentTable"><span class="nav-icon">S</span><span class="nav-text">Student Table</span></a></li>
                  <li><a href="#" data-action="uiDemo"><span class="nav-icon">U</span><span class="nav-text">UI Component Demo</span></a></li>
                  <li><a href="#" data-action="uiTabToastDemo"><span class="nav-icon">T</span><span class="nav-text">Tab + Toast Demo</span></a></li>
                </ul>
              </div>

              <div role="group" aria-labelledby="group-label-content-2">
                <h3 id="group-label-content-2">Settings</h3>
                <ul>
                  <li><a href="#" data-action="toggleTheme"><span class="nav-icon">M</span><span class="nav-text">Toggle Dark Mode</span></a></li>
                  <li><a href="#" data-action="logout"><span class="nav-icon">L</span><span class="nav-text">Logout</span></a></li>
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
      if (this.isMobileMode()) {
        this.setWidth(this._expandedWidth);
        this.setMinWidth(this._expandedWidth);
        this.resetMaxWidth();
        this.setAllowGrowX(true);
        this.setAllowShrinkX(true);
      } else {
        this.setWidth(collapsed ? this._collapsedWidth : this._expandedWidth);
        this.setMinWidth(collapsed ? this._collapsedWidth : this._expandedWidth);
        this.resetMaxWidth();
      }

      if (this._card) {
        const hideLabels = collapsed && !this.isMobileMode();
        this._card.setTitle(hideLabels ? "" : "Quick Access");
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
        toggleBtn.textContent = collapsed ? "▶" : "◀";
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
