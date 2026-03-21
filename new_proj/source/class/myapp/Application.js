/**
 * Student registration system with modern shell:
 * - Login page
 * - MenuBar + Sidebar
 * - Main content screen routing (no floating windows)
 */
qx.Class.define("myapp.Application", {
    extend: qx.application.Standalone,
    members: {
        __loginView: null,
        __mainView: null,
        __contentStack: null,
        __menuBar: null,
        __sidebar: null,
        __bodyShell: null,
        __contentRow: null,
        __drawerBackdrop: null,
        __shellMobileDrawer: false,
        __mobileSidebarVisible: false,
        __drawerBackdropClickBound: null,
        __mobileBreakpoint: 900,
        __screens: null,
        __personalTab: null,
        __contactTab: null,
        __academicTab: null,
        __studentTableTab: null,
        __uiDemoTab: null,
        __uiTabToastDemoTab: null,
        main() {
            this.base(arguments);
            const root = this.getRoot();
            this.__loginView = this._buildLoginView();
            this.__mainView = this._buildMainView();
            this.__mainView.setVisibility("excluded");
            root.add(this.__loginView, { edge: 0 });
            root.add(this.__mainView, { edge: 0 });
            this._applyThemeRoot();
            this._applyResponsiveShell();
            root.addListener("resize", this._applyResponsiveShell, this);
        },
        _buildLoginView() {
            const login = new myapp.pages.Login();
            login.addListener("loginSuccess", () => {
                this._showMainView();
            }, this);
            return login;
        },
        _buildMainView() {
            const page = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
            myapp.util.Theme.applyBackground(page, "background");
            this.__menuBar = new myapp.components.MenuBar();
            this.__menuBar.addListener("logout", this._logout, this);
            this.__menuBar.addListener("toggleSidebar", this._toggleSidebar, this);
            this.__menuBar.addListener("toggleQuickActions", () => this._showScreen("studentTable"), this);
            this.__bodyShell = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
            this.__bodyShell.setAllowGrowY(true);
            this.__bodyShell.setAllowGrowX(true);
            this.__contentRow = new qx.ui.container.Composite(new qx.ui.layout.HBox(0));
            this.__contentRow.setAllowGrowY(true);
            this.__contentRow.setAllowGrowX(true);
            this.__sidebar = new myapp.components.Sidebar();
            this.__sidebar.addListener("openWindowRequest", (e) => {
                this._showScreen(String(e.getData() || ""));
            }, this);
            this.__sidebar.addListener("toggleSidebarRequest", this._toggleSidebar, this);
            this.__sidebar.addListener("toggleThemeRequest", this.toggleTheme, this);
            this.__sidebar.addListener("logoutRequest", this._logout, this);
            this.__contentStack = new qx.ui.container.Composite(new qx.ui.layout.Grow());
            this.__contentStack.setPadding(12);
            this._buildScreens();
            this.__contentRow.add(this.__sidebar);
            this.__contentRow.add(this.__contentStack, { flex: 1 });
            this.__bodyShell.add(this.__contentRow, { left: 0, top: 0, right: 0, bottom: 0 });
            this.__drawerBackdropClickBound = () => {
                this._closeMobileDrawer();
            };
            this.__drawerBackdrop = new qx.ui.embed.Html("<div class=\"app-mobile-drawer-backdrop\" aria-hidden=\"true\"></div>");
            this.__drawerBackdrop.setVisibility("excluded");
            this.__drawerBackdrop.addListenerOnce("appear", () => {
                const wrap = this.__drawerBackdrop.getContentElement?.().getDomElement?.();
                if (!wrap)
                    return;
                wrap.style.width = "100%";
                wrap.style.height = "100%";
                wrap.style.zIndex = "2";
                const inner = wrap.querySelector(".app-mobile-drawer-backdrop") || wrap;
                inner.style.cssText =
                    "position:absolute;inset:0;background:rgba(15,23,42,0.45);opacity:0;visibility:hidden;" +
                        "pointer-events:none;transition:opacity 0.28s ease, visibility 0.28s ease;";
            }, this);
            page.add(this.__menuBar);
            page.add(this.__bodyShell, { flex: 1 });
            const tabRouter = this._createTabRouter();
            this.__menuBar.setWindowManager(tabRouter);
            return page;
        },
        _buildScreens() {
            this.__personalTab = new myapp.components.Tabs.PersonalInfoTab();
            this.__contactTab = new myapp.components.Tabs.ContactInfoTab();
            this.__academicTab = new myapp.components.Tabs.AcademicInfoTab();
            this.__studentTableTab = new myapp.components.Tabs.StudentInfoTable();
            this.__uiDemoTab = new myapp.components.Tabs.UISampleTab();
            this.__uiTabToastDemoTab = new myapp.components.Tabs.UITabToastSampleTab();
            this.__screens = {
                personalInfo: this.__personalTab,
                contactInfo: this.__contactTab,
                academicInfo: this.__academicTab,
                studentTable: this.__studentTableTab,
                uiDemo: this.__uiDemoTab,
                uiTabToastDemo: this.__uiTabToastDemoTab
            };
            Object.keys(this.__screens).forEach((key) => {
                const widget = this.__screens[key];
                widget.setVisibility("excluded");
                this.__contentStack.add(widget);
            });
        },
        _createTabRouter() {
            return {
                openWindow: (key) => this._showScreen(key),
                closeAllWindows: () => { },
                cascadeWindows: () => { },
                tileWindows: () => { },
                getWindow: (key) => {
                    if (key !== "studentTable")
                        return null;
                    return {
                        getStudentInfoTable: () => this.__studentTableTab
                    };
                }
            };
        },
        _showMainView() {
            this.__loginView.setVisibility("excluded");
            this.__mainView.setVisibility("visible");
            this.__mobileSidebarVisible = false;
            if (this.__studentTableTab && this.__studentTableTab.loadStudents) {
                this.__studentTableTab.loadStudents();
            }
            this._showScreen("studentTable");
            this._applyResponsiveShell();
        },
        _showScreen(screenKey) {
            if (!this.__screens)
                return;
            const target = this.__screens[screenKey] || this.__screens.studentTable;
            if (!target)
                return;
            Object.keys(this.__screens).forEach((key) => {
                this.__screens[key].setVisibility(this.__screens[key] === target ? "visible" : "excluded");
            });
            if (target === this.__studentTableTab && this.__studentTableTab.loadStudents) {
                this.__studentTableTab.loadStudents();
            }
            if (this.__shellMobileDrawer && this.__sidebar) {
                this._closeMobileDrawer();
            }
        },
        _closeMobileDrawer() {
            if (!this.__shellMobileDrawer)
                return;
            this.__mobileSidebarVisible = false;
            this._syncMobileDrawerVisuals();
        },
        _toggleSidebar() {
            if (!this.__sidebar)
                return;
            if (this.__sidebar.isMobileMode && this.__sidebar.isMobileMode()) {
                this.__mobileSidebarVisible = !this.__mobileSidebarVisible;
                this._syncMobileDrawerVisuals();
                return;
            }
            this.__sidebar.setCollapsed(!this.__sidebar.isCollapsed());
        },
        _syncMobileDrawerVisuals() {
            if (!this.__shellMobileDrawer || !this.__sidebar)
                return;
            if (this.__sidebar.setMobileDrawerOpen) {
                this.__sidebar.setMobileDrawerOpen(this.__mobileSidebarVisible);
            }
            const wrap = this.__drawerBackdrop?.getContentElement?.()?.getDomElement?.();
            if (!wrap)
                return;
            const inner = wrap.querySelector(".app-mobile-drawer-backdrop") || wrap;
            const el = inner;
            if (this.__mobileSidebarVisible) {
                el.style.visibility = "visible";
                el.style.opacity = "1";
                el.style.pointerEvents = "auto";
            }
            else {
                el.style.opacity = "0";
                el.style.pointerEvents = "none";
                el.style.visibility = "hidden";
            }
        },
        _applyMobileDrawerShell(compact) {
            if (!this.__bodyShell || !this.__contentRow || !this.__sidebar || !this.__drawerBackdrop)
                return;
            if (compact) {
                if (this.__shellMobileDrawer) {
                    this._syncMobileDrawerVisuals();
                    return;
                }
                this.__contentRow.remove(this.__sidebar);
                this.__drawerBackdrop.setVisibility("visible");
                this.__bodyShell.add(this.__drawerBackdrop, { left: 0, top: 0, right: 0, bottom: 0 });
                this.__bodyShell.add(this.__sidebar, { left: 0, top: 0, bottom: 0 });
                const drawerW = this.__sidebar.getDrawerWidth ? this.__sidebar.getDrawerWidth() : 300;
                this.__sidebar.setWidth(drawerW);
                this.__sidebar.setMinWidth(drawerW);
                this.__sidebar.setMaxWidth(drawerW);
                this.__sidebar.setVisibility("visible");
                if (this.__sidebar.setMobileDrawerLayerActive) {
                    this.__sidebar.setMobileDrawerLayerActive(true);
                }
                this.__shellMobileDrawer = true;
                this.__mobileSidebarVisible = false;
                this._syncMobileDrawerVisuals();
                qx.event.Timer.once(() => this._bindMobileBackdropClick(), this, 0);
            }
            else {
                if (!this.__shellMobileDrawer)
                    return;
                this._unbindMobileBackdropClick();
                this.__bodyShell.remove(this.__drawerBackdrop);
                this.__bodyShell.remove(this.__sidebar);
                this.__drawerBackdrop.setVisibility("excluded");
                this.__contentRow.addAt(this.__sidebar, 0);
                this.__shellMobileDrawer = false;
                this.__mobileSidebarVisible = false;
                if (this.__sidebar.setMobileDrawerLayerActive) {
                    this.__sidebar.setMobileDrawerLayerActive(false);
                }
                this.__sidebar.resetMaxWidth();
                this.__sidebar.setVisibility("visible");
                if (this.__sidebar.refreshLayoutAfterDesktopRestore) {
                    this.__sidebar.refreshLayoutAfterDesktopRestore();
                }
            }
        },
        _bindMobileBackdropClick() {
            const wrap = this.__drawerBackdrop?.getContentElement?.()?.getDomElement?.();
            if (!wrap || !this.__drawerBackdropClickBound)
                return;
            const inner = wrap.querySelector(".app-mobile-drawer-backdrop");
            if (!inner || inner.dataset.appBackdropBound === "1")
                return;
            inner.addEventListener("click", this.__drawerBackdropClickBound);
            inner.dataset.appBackdropBound = "1";
        },
        _unbindMobileBackdropClick() {
            const wrap = this.__drawerBackdrop?.getContentElement?.()?.getDomElement?.();
            if (!wrap || !this.__drawerBackdropClickBound)
                return;
            const inner = wrap.querySelector(".app-mobile-drawer-backdrop");
            if (!inner || inner.dataset.appBackdropBound !== "1")
                return;
            inner.removeEventListener("click", this.__drawerBackdropClickBound);
            delete inner.dataset.appBackdropBound;
        },
        _applyResponsiveShell() {
            const width = window.innerWidth || 1200;
            const compact = width <= this.__mobileBreakpoint;
            if (this.__menuBar && this.__menuBar.setCompactMode) {
                this.__menuBar.setCompactMode(compact);
            }
            if (this.__sidebar) {
                this.__sidebar.setMobileMode(compact);
                this._applyMobileDrawerShell(compact);
                if (!compact) {
                    this.__sidebar.setVisibility("visible");
                }
            }
        },
        _logout() {
            this.__mainView.setVisibility("excluded");
            this.__loginView.setVisibility("visible");
            this.__mobileSidebarVisible = false;
            if (this.__sidebar) {
                this.__sidebar.setCollapsed(false);
            }
            if (this.__loginView && this.__loginView.clear) {
                this.__loginView.clear();
            }
        },
        toggleTheme() {
            document.documentElement.classList.toggle("dark");
            this._applyThemeRoot();
        },
        _applyThemeRoot() {
            document.body.style.backgroundColor = "var(--background)";
            document.body.style.color = "var(--foreground)";
        }
    }
});
