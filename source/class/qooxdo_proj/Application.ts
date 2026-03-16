/**
 * @asset(qooxdo_proj/*)
 */
qx.Class.define("qooxdo_proj.Application",
  {
    extend: qx.application.Standalone,

    members:
    {
      _windowManager: null as any,
      _personalInfoWindow: null as any,
      _contactInfoWindow: null as any,
      _academicInfoWindow: null as any,
      _studentInfoTableWindow: null as any,
      _uiDemoWindow: null as any,
      _uiTabToastDemoWindow: null as any,
      _statusLabel: null as any,
      _loginPage: null as any,
      _mainContainer: null as any,
      _sidebar: null as any,
      _menuBar: null as any,
      _buttonContainer: null as any,
      _mobileBreakpoint: 900,
      _actionButtonsRow: null as any,
      _formActionButtons: null as any,
      _counterButtons: null as any,
      _mobileLayoutPassScheduled: false,
      _mobileSidebarOpen: false,
      _mobileSidebarBackdrop: null as any,

      main(): void {
        (this as any).base(arguments);

        const root = this.getRoot();
        
        // Create login page (visible initially)
        this._loginPage = new qooxdo_proj.pages.Login();
        root.add(this._loginPage, { edge: 0 });
        
        // Listen for successful login
        this._loginPage.addListener("loginSuccess", (e) => {
          const data = e.getData();
          this._handleLoginSuccess(data.username);
        }, this);
        
        // Create main container (hidden initially) - add it first so login page is on top
        this._mainContainer = new qx.ui.container.Composite();
        this._mainContainer.setLayout(new qx.ui.layout.Canvas());
        this._mainContainer.setVisibility("hidden");
        root.add(this._mainContainer, { edge: 0 });
        
        // Initialize main application (but it will be hidden until login)
        this._initializeMainApplication();
        this._runTsUsageCheck();
      },

      _initializeMainApplication(): void {
        const rootContainer = this._mainContainer;
        const root = this.getRoot();
        
        // Initialize Window Manager
        this._windowManager = new qooxdo_proj.components.WindowManager();
        this._windowManager.init(root);

        // Create Menu Bar component and pass window manager reference
        this._menuBar = new qooxdo_proj.components.MenuBar();
        const menuBar = this._menuBar;
        menuBar.setWindowManager(this._windowManager);
        
        // Listen for logout event
        menuBar.addListener("logout", () => {
          this._handleLogout();
        }, this);
        menuBar.addListener("toggleSidebar", () => {
          const width = window.innerWidth || 1200;
          if (width <= this._mobileBreakpoint) {
            this._mobileSidebarOpen = !this._mobileSidebarOpen;
            syncSidebarAndNavbarLayout();
          }
        }, this);
        menuBar.addListener("toggleQuickActions", () => {
          if (!this._buttonContainer) return;
          if (this._buttonContainer.isVisible && this._buttonContainer.isVisible()) {
            this._buttonContainer.close();
          } else {
            this._buttonContainer.open();
            this._buttonContainer.setVisibility("visible");
            syncSidebarAndNavbarLayout();
          }
        }, this);
        
        rootContainer.add(menuBar, { left: 0, top: 0, right: 0 });

        // Sidebar built with custom Card component
        this._sidebar = new qooxdo_proj.components.Sidebar();
        this._sidebar.setMinWidth(280);
        this._sidebar.setWidth(280);
        rootContainer.add(this._sidebar, { left: 0, top: 0, bottom: 0 });

        // Backdrop used only when mobile off-canvas sidebar is open.
        this._mobileSidebarBackdrop = new qx.ui.core.Widget();
        this._mobileSidebarBackdrop.setVisibility("excluded");
        this._mobileSidebarBackdrop.addListenerOnce("appear", () => {
          const el = this._mobileSidebarBackdrop.getContentElement
            ? this._mobileSidebarBackdrop.getContentElement().getDomElement()
            : null;
          if (!el) return;
          el.style.background = "rgba(15, 23, 42, 0.35)";
        }, this);
        this._mobileSidebarBackdrop.addListener("pointerdown", () => {
          this._mobileSidebarOpen = false;
          syncSidebarAndNavbarLayout();
        }, this);
        rootContainer.add(this._mobileSidebarBackdrop, { left: 0, right: 0, top: 52, bottom: 0 });

        const syncSidebarAndNavbarLayout = () => {
          const rootBounds = rootContainer.getBounds ? rootContainer.getBounds() : null;
          const viewportWidth = (rootBounds && rootBounds.width) || window.innerWidth || 1200;
          const isMobile = viewportWidth <= this._mobileBreakpoint;
          const isMainScreenVisible =
            !!this._mainContainer && this._mainContainer.getVisibility && this._mainContainer.getVisibility() === "visible";

          const sidebarBounds = this._sidebar.getBounds ? this._sidebar.getBounds() : null;
          const sidebarWidth = (sidebarBounds && sidebarBounds.width) || this._sidebar.getWidth() || 280;
          const setLayoutProps = (widget, props) => {
            if (widget && widget.setLayoutProperties) {
              widget.setLayoutProperties(props);
            }
          };

          if (this._sidebar && this._sidebar.setMobileMode) {
            this._sidebar.setMobileMode(isMobile);
          }
          if (menuBar && menuBar.setCompactMode) {
            menuBar.setCompactMode(isMobile);
          }

          if (isMobile) {
            const mobileSidebarWidth = Math.max(220, Math.min(300, Math.round(viewportWidth * 0.82)));
            const hiddenLeft = -(mobileSidebarWidth + 40);
            this._sidebar.setCollapsed(false);
            this._sidebar.setWidth(mobileSidebarWidth);
            this._sidebar.setMinWidth(mobileSidebarWidth);
            this._sidebar.setMaxWidth(mobileSidebarWidth);
            // Mobile: stack navbar + sidebar vertically.
            setLayoutProps(menuBar, { left: 0, top: 0, right: 0 });
            this._sidebar.resetHeight();
            this._sidebar.resetMaxHeight();
            setLayoutProps(this._sidebar, {
              left: this._mobileSidebarOpen ? 0 : hiddenLeft,
              top: 52,
              bottom: 0,
              right: null
            });
            this._sidebar.setZIndex(20);
            if (this._mobileSidebarBackdrop) {
              setLayoutProps(this._mobileSidebarBackdrop, { left: 0, right: 0, top: 52, bottom: 0 });
              this._mobileSidebarBackdrop.setVisibility(this._mobileSidebarOpen ? "visible" : "excluded");
              this._mobileSidebarBackdrop.setZIndex(10);
            }

            if (this._buttonContainer) {
              const mobilePanelWidth = Math.max(280, viewportWidth - 24);
              this._buttonContainer.setWidth(mobilePanelWidth);
              if (this._buttonContainer.moveTo) {
                this._buttonContainer.moveTo(12, 72);
              }
              if (this._buttonContainer.isVisible && this._buttonContainer.isVisible()) {
                this._buttonContainer.setVisibility(
                  isMainScreenVisible && !this._mobileSidebarOpen ? "visible" : "excluded"
                );
              }
            }
            if (this._actionButtonsRow) {
              this._actionButtonsRow.setLayout(new qx.ui.layout.VBox(8));
            }
            if (this._formActionButtons) {
              this._formActionButtons.setLayout(new qx.ui.layout.HBox(8));
            }
            if (this._counterButtons) {
              this._counterButtons.setLayout(new qx.ui.layout.HBox(8));
            }

          } else {
            // Desktop: fixed left rail + navbar offset.
            this._mobileLayoutPassScheduled = false;
            this._mobileSidebarOpen = false;
            const desktopSidebarWidth = Math.max(280, Math.min(360, Math.round(viewportWidth * 0.2)));
            if (this._sidebar && this._sidebar.setExpandedWidth) {
              this._sidebar.setExpandedWidth(desktopSidebarWidth);
            }
            this._sidebar.resetHeight();
            this._sidebar.resetMaxHeight();
            this._sidebar.resetMaxWidth();
            setLayoutProps(this._sidebar, { left: 0, top: 0, bottom: 0, right: null });
            this._sidebar.setZIndex(0);
            if (this._mobileSidebarBackdrop) {
              this._mobileSidebarBackdrop.setVisibility("excluded");
              this._mobileSidebarBackdrop.setZIndex(0);
            }
            setLayoutProps(menuBar, { left: sidebarWidth, top: 0, right: 0 });
            if (this._buttonContainer) {
              this._buttonContainer.setWidth(400);
              const quickActionsX = Math.max(12, viewportWidth - 400 - 50);
              if (this._buttonContainer.moveTo) {
                this._buttonContainer.moveTo(quickActionsX, 80);
              }
              if (this._buttonContainer.isVisible && this._buttonContainer.isVisible()) {
                this._buttonContainer.setVisibility(isMainScreenVisible ? "visible" : "excluded");
              }
            }
            if (this._actionButtonsRow) {
              this._actionButtonsRow.setLayout(new qx.ui.layout.HBox(10));
            }
            if (this._formActionButtons) {
              this._formActionButtons.setLayout(new qx.ui.layout.HBox(10));
            }
            if (this._counterButtons) {
              this._counterButtons.setLayout(new qx.ui.layout.HBox(10));
            }
          }
        };

        this._sidebar.addListener("appear", syncSidebarAndNavbarLayout, this);
        this._sidebar.addListener("resize", syncSidebarAndNavbarLayout, this);
        this._sidebar.addListener("changeCollapsed", syncSidebarAndNavbarLayout, this);
        this._sidebar.addListener("toggleSidebarRequest", () => {
          const width = window.innerWidth || 1200;
          if (width <= this._mobileBreakpoint) {
            this._mobileSidebarOpen = !this._mobileSidebarOpen;
            syncSidebarAndNavbarLayout();
            return;
          }
          this._sidebar.setCollapsed(!this._sidebar.isCollapsed());
        }, this);
        root.addListener("resize", syncSidebarAndNavbarLayout, this);
        qx.event.Timer.once(syncSidebarAndNavbarLayout, this, 0);

        this._sidebar.addListener("openWindowRequest", (e) => {
          const key = e.getData();
          if (this._windowManager && key) {
            this._windowManager.openWindow(key);
          }
          const width = window.innerWidth || 1200;
          if (width <= this._mobileBreakpoint) {
            this._mobileSidebarOpen = false;
            syncSidebarAndNavbarLayout();
          }
        }, this);

        this._sidebar.addListener("toggleThemeRequest", () => {
          this.toggleTheme();
        }, this);

        this._sidebar.addListener("logoutRequest", () => {
          this._handleLogout();
        }, this);

        // Create window components
        this._personalInfoWindow = new qooxdo_proj.components.Windows.PersonalInfoWindow();
        this._contactInfoWindow = new qooxdo_proj.components.Windows.ContactInfoWindow();
        this._academicInfoWindow = new qooxdo_proj.components.Windows.AcademicInfoWindow();
        this._studentInfoTableWindow = new qooxdo_proj.components.Windows.StudentInfoTableWindow();

        // Register windows with WindowManager (but don't open them yet - wait for login)
        this._windowManager.registerWindow(
          "personalInfo",
          this._personalInfoWindow,
          { left: 50, top: 80, open: false }
        );

        this._windowManager.registerWindow(
          "contactInfo",
          this._contactInfoWindow,
          { left: 680, top: 80, open: false }
        );

        this._windowManager.registerWindow(
          "academicInfo",
          this._academicInfoWindow,
          { left: 1310, top: 80, open: false }
        );

        this._windowManager.registerWindow(
          "studentTable",
          this._studentInfoTableWindow,
          { left: 50, top: 600, open: false, }
        );

        // UI demo window (shows examples of the custom components)
        this._uiDemoWindow = new qooxdo_proj.components.Windows.UIDemoWindow();
        this._windowManager.registerWindow(
          "uiDemo",
          this._uiDemoWindow,
          { left: 700, top: 600, open: false }
        );

        // Separate demo window for TabView + Toast
        this._uiTabToastDemoWindow = new qooxdo_proj.components.Windows.UITabToastDemoWindow();
        this._windowManager.registerWindow(
          "uiTabToastDemo",
          this._uiTabToastDemoWindow,
          { left: 1380, top: 600, open: false }
        );

        // Load students when table window is opened
        this._studentInfoTableWindow.addListener("appear", () => {
          this._studentInfoTableWindow.loadStudents();
        }, this);

        // Main panel content for the quick actions window
        const mainContainer = new qx.ui.container.Composite();
        mainContainer.setLayout(new qx.ui.layout.VBox(10));
        mainContainer.setPadding(20);
        qooxdo_proj.util.Theme.styleContainer(mainContainer, {
          background: "card",
          foreground: "card-foreground",
          border: true,
          padding: 20
        });
        mainContainer.setDecorator("main");

        // Header
        const header = new qooxdo_proj.components.ui.Label("Student Registration System");
        header.setFont("bold");
        mainContainer.add(header);

        // Create Form Action Buttons component
        const formActionButtons = new qooxdo_proj.components.Buttons.FormActionButtons();
        this._formActionButtons = formActionButtons;

        // Create Counter Buttons component
        const counterButtons = new qooxdo_proj.components.Buttons.CounterButtons();
        this._counterButtons = counterButtons;

        // Button container
        const buttonContainer = new qx.ui.container.Composite();
        buttonContainer.setLayout(new qx.ui.layout.HBox(10));
        buttonContainer.setAllowGrowX(true);
        buttonContainer.setAllowShrinkX(true);
        buttonContainer.setMinWidth(0);
        buttonContainer.add(formActionButtons, { flex: 1 });
        buttonContainer.add(counterButtons, { flex: 1 });
        mainContainer.add(buttonContainer);
        this._actionButtonsRow = buttonContainer;

        // Status
        this._statusLabel = new qooxdo_proj.components.ui.Label("Ready");
        this._statusLabel.setRich(true);
        mainContainer.add(this._statusLabel);

        // Form Action Buttons event handlers
        formActionButtons.addListener("submit", () => {
          this._handleSubmit();
        });

        formActionButtons.addListener("cancel", () => {
          this._handleCancel();
        });

        // Counter Buttons event handlers
        counterButtons.addListener("pressMe", (e) => {
          const data = e.getData();
          this._statusLabel.setValue(data.message);
        });

        counterButtons.addListener("resetCounter", () => {
          this._statusLabel.setValue("Counter reset to 0");
        });

        const mainPanelWindow = new qx.ui.window.Window("Quick Actions");
        mainPanelWindow.setLayout(new qx.ui.layout.Grow());
        mainPanelWindow.setShowClose(true);
        mainPanelWindow.setAllowClose(true);
        mainPanelWindow.setShowMaximize(false);
        mainPanelWindow.setAllowMaximize(false);
        mainPanelWindow.setShowMinimize(true);
        mainPanelWindow.setAllowMinimize(true);
        mainPanelWindow.setMovable(true);
        mainPanelWindow.setResizable(false);
        mainPanelWindow.setWidth(400);
        mainPanelWindow.setMinWidth(340);
        mainPanelWindow.add(mainContainer);
        root.add(mainPanelWindow, { right: 50, top: 80 });
        mainPanelWindow.close();  
        
        // Store reference to the window for responsive positioning
        this._buttonContainer = mainPanelWindow;
        qx.event.Timer.once(syncSidebarAndNavbarLayout, this, 0);
      },

      _handleLoginSuccess(username: string): void {
        // Hide login page
        this._loginPage.setVisibility("hidden");
        
        // Show main application
        this._mainContainer.setVisibility("visible");
        
        // Don't open windows automatically - let user open them via menu
        
        // Optional: Update status to show logged in user
        if (this._statusLabel) {
          const primaryColor = qooxdo_proj.util.Theme.getCSSVariable("primary");
          this._statusLabel.setValue(`<span style='color: ${primaryColor};'>Welcome, ${username}!</span>`);
        }
        if (this._buttonContainer) {
          this._buttonContainer.close();
        }
        if (this._sidebar) {
          this._sidebar.setSidebarSubtitle(`Signed in as ${username}`);
        }
      },

      _handleLogout(): void {
        // Close all windows
        if (this._windowManager) {
          this._windowManager.closeAllWindows();
        }
        
        // Hide main application
        this._mainContainer.setVisibility("hidden");
        if (this._buttonContainer) {
          this._buttonContainer.close();
        }
        
        // Show login page
        this._loginPage.setVisibility("visible");
        
        // Clear login form
        this._loginPage.clear();
        
        // Clear all form windows
        if (this._personalInfoWindow) {
          this._personalInfoWindow.clear();
        }
        if (this._contactInfoWindow) {
          this._contactInfoWindow.clear();
        }
        if (this._academicInfoWindow) {
          this._academicInfoWindow.clear();
        }
        
        // Reset status label
        if (this._statusLabel) {
          this._statusLabel.setValue("Ready");
        }
        if (this._sidebar) {
          this._sidebar.setSidebarSubtitle("Open forms and actions");
        }
      },

      _handleSubmit(): void {
        // Validate all forms
        const destructiveColor = qooxdo_proj.util.Theme.getCSSVariable("destructive");
        const personalValidation = this._personalInfoWindow.validate();
        if (!personalValidation.valid) {
          this._statusLabel.setValue(`<span style='color: ${destructiveColor};'>Error: ` + personalValidation.message + "</span>");
          // Open the personal info window if it's closed
          this._windowManager.openWindow("personalInfo");
          return;
        }

        const contactValidation = this._contactInfoWindow.validate();
        if (!contactValidation.valid) {
          this._statusLabel.setValue(`<span style='color: ${destructiveColor};'>Error: ` + contactValidation.message + "</span>");
          // Open the contact info window if it's closed
          this._windowManager.openWindow("contactInfo");
          return;
        }

        const academicValidation = this._academicInfoWindow.validate();
        if (!academicValidation.valid) {
          this._statusLabel.setValue(`<span style='color: ${destructiveColor};'>Error: ` + academicValidation.message + "</span>");
          // Open the academic info window if it's closed
          this._windowManager.openWindow("academicInfo");
          return;
        }

        // Get data from all forms
        const personalData = this._personalInfoWindow.getData();
        const contactData = this._contactInfoWindow.getData();
        const academicData = this._academicInfoWindow.getData();

        // Helper function to normalize yearLevel
        const normalizeYearLevel = (yearLevel: string | number | null | undefined): string => {
          if (!yearLevel) return "";
          if (typeof yearLevel === 'number') return String(yearLevel);
          const str = String(yearLevel).trim();
          if (!str) return "";
          const match = str.match(/(\d+)/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num >= 1 && num <= 4) return String(num);
          }
          return str;
        };

        // Combine all data
        const studentData = {
          studentId: personalData.studentId,
          firstName: personalData.firstName,
          lastName: personalData.lastName,
          dateOfBirth: personalData.dateOfBirth ? personalData.dateOfBirth.toISOString() : null,
          gender: personalData.gender,
          address: personalData.address,
          email: contactData.email,
          personalPhone: contactData.personalPhone,
          emergencyContact: contactData.emergencyContact,
          emergencyContactPhone: contactData.emergencyContactPhone,
          relationship: contactData.relationship,
          program: academicData.program,
          yearLevel: normalizeYearLevel(academicData.yearLevel),
          gradeSchool: academicData.previousSchools.gradeSchool,
          highSchool: academicData.previousSchools.highSchool,
          college: academicData.previousSchools.college
        };

        // Send to REST API
        const primaryColor = qooxdo_proj.util.Theme.getCSSVariable("primary");
        this._statusLabel.setValue(`<span style='color: ${primaryColor};'>Saving student...</span>`);

        fetch("http://localhost:3000/api/students", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(studentData)
        })
        .then(response => {
          if (!response.ok) {
            return response.json().then(errorData => {
              throw new Error(errorData.error || `Server error: ${response.status}`);
            }).catch(() => {
              throw new Error(`Server error: ${response.status}`);
            });
          }
          return response.json();
        })
        .then(savedStudent => {
          // Add student to table
          this._studentInfoTableWindow.addStudent({
            id: savedStudent.id,
            studentId: savedStudent.studentId,
            firstName: savedStudent.firstName,
            lastName: savedStudent.lastName,
            program: savedStudent.program,
            yearLevel: savedStudent.yearLevel
          });

          const successColor = qooxdo_proj.util.Theme.getCSSVariable("primary");
          this._statusLabel.setValue(`<span style='color: ${successColor};'>Student registered successfully!</span>`);
          this._windowManager.openWindow("studentTable");
          
          // Clear forms
          this._personalInfoWindow.clear();
          this._contactInfoWindow.clear();
          this._academicInfoWindow.clear();
        })
        .catch(error => {
          console.error("Save student error:", error);
          const destructiveColor = qooxdo_proj.util.Theme.getCSSVariable("destructive");
          this._statusLabel.setValue(`<span style='color: ${destructiveColor};'>Error: ` + error.message + "</span>");
        });
      },

      _handleCancel(): void {
        this._personalInfoWindow.clear();
        this._contactInfoWindow.clear();
        this._academicInfoWindow.clear();
        this._statusLabel.setValue("All form fields cleared");
      },

      _runTsUsageCheck(): void {
        const expectedClasses = [
          "qooxdo_proj.pages.Login",
          "qooxdo_proj.util.Theme",
          "qooxdo_proj.components.WindowManager",
          "qooxdo_proj.components.MenuBar",
          "qooxdo_proj.components.Sidebar",
          "qooxdo_proj.components.Buttons.FormActionButtons",
          "qooxdo_proj.components.Buttons.CounterButtons",
          "qooxdo_proj.components.Windows.PersonalInfoWindow",
          "qooxdo_proj.components.Windows.ContactInfoWindow",
          "qooxdo_proj.components.Windows.AcademicInfoWindow",
          "qooxdo_proj.components.Windows.StudentInfoTableWindow",
          "qooxdo_proj.components.Windows.UIDemoWindow",
          "qooxdo_proj.components.Windows.UITabToastDemoWindow",
          "qooxdo_proj.components.Windows.RegistrationWindow",
          "qooxdo_proj.components.Tabs.PersonalInfoTab",
          "qooxdo_proj.components.Tabs.ContactInfoTab",
          "qooxdo_proj.components.Tabs.AcademicInfoTab",
          "qooxdo_proj.components.Tabs.StudentInfoTable",
          "qooxdo_proj.components.Tabs.UISampleTab",
          "qooxdo_proj.components.Tabs.UITabToastSampleTab",
          "qooxdo_proj.components.ui.Button",
          "qooxdo_proj.components.ui.Label",
          "qooxdo_proj.components.ui.CheckBox",
          "qooxdo_proj.components.ui.ComboBox",
          "qooxdo_proj.components.ui.DateField",
          "qooxdo_proj.components.ui.Dialog",
          "qooxdo_proj.components.ui.DropdownMenu",
          "qooxdo_proj.components.ui.PasswordField",
          "qooxdo_proj.components.ui.Popover",
          "qooxdo_proj.components.ui.RadioButton",
          "qooxdo_proj.components.ui.TabView",
          "qooxdo_proj.components.ui.TabPage",
          "qooxdo_proj.components.ui.Table",
          "qooxdo_proj.components.ui.TextArea",
          "qooxdo_proj.components.ui.TextField",
          "qooxdo_proj.components.ui.Toast",
          "qooxdo_proj.components.ui.ToolTip",
          "qooxdo_proj.components.ui.Accordion",
          "qooxdo_proj.components.ui.Card",
          "qooxdo_proj.components.ui.Pagination",
          "qooxdo_proj.components.ui.MenuSeparator"
        ];

        const qxClass = qx && qx["Class"] ? qx["Class"] : null;
        const missing = expectedClasses.filter(className => {
          if (!qxClass || !qxClass.getByName) {
            return true;
          }
          return !qxClass.getByName(className);
        });

        if (missing.length > 0) {
          console.warn("[TS Usage Check] Missing/unloaded classes:", missing);
          return;
        }

        console.info(`[TS Usage Check] All ${expectedClasses.length} tracked TypeScript classes are loaded.`);
      },

      // Public method to get window manager (for menu bar access)
      getWindowManager(): any {
        return this._windowManager;
      },

      // Toggle dark mode theme
      toggleTheme(): void {
        document.documentElement.classList.toggle("dark");
      }
    }
  });
