/**
 * @asset(qooxdo_proj/*)
 */
qx.Class.define("qooxdo_proj.Application",
  {
    extend: qx.application.Standalone,

    members:
    {
      _windowManager: null,
      _personalInfoWindow: null,
      _contactInfoWindow: null,
      _academicInfoWindow: null,
      _studentInfoTableWindow: null,
      _uiDemoWindow: null,
      _statusLabel: null,
      _loginPage: null,
      _mainContainer: null,
      _sidebar: null,
      _menuBar: null,
      _mobileBreakpoint: 900,
      _actionButtonsRow: null,
      _formActionButtons: null,
      _counterButtons: null,
      _mobileLayoutPassScheduled: false,
      _mobileSidebarOpen: false,
      _mobileSidebarBackdrop: null,

      main() {
        this.base(arguments);

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
      },

      _initializeMainApplication() {
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
              this._buttonContainer.resetWidth();
              setLayoutProps(this._buttonContainer, {
                left: 12,
                right: 12,
                top: 72,
                bottom: null
              });
              this._buttonContainer.setVisibility(this._mobileSidebarOpen ? "excluded" : "visible");
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
            this._sidebar.resetHeight();
            this._sidebar.resetMaxHeight();
            this._sidebar.resetMaxWidth();
            this._sidebar.setCollapsed(false);
            setLayoutProps(this._sidebar, { left: 0, top: 0, bottom: 0, right: null });
            this._sidebar.setZIndex(0);
            if (this._mobileSidebarBackdrop) {
              this._mobileSidebarBackdrop.setVisibility("excluded");
              this._mobileSidebarBackdrop.setZIndex(0);
            }
            setLayoutProps(menuBar, { left: sidebarWidth, top: 0, right: 0 });
            if (this._buttonContainer) {
              this._buttonContainer.setWidth(400);
              setLayoutProps(this._buttonContainer, { right: 50, top: 80, left: null, bottom: null });
              this._buttonContainer.setVisibility("visible");
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

        // Main container for buttons and status
        const mainContainer = new qx.ui.container.Composite();
        mainContainer.setLayout(new qx.ui.layout.VBox(10));
        mainContainer.setPadding(20);
        // Apply theme card colors
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

        mainContainer.setWidth(400);
        // Position the main container in the bottom right area to avoid overlapping with windows
        rootContainer.add(mainContainer, { right: 50, top: 80 });
        
        // Store reference to main container for later use
        this._buttonContainer = mainContainer;
        qx.event.Timer.once(syncSidebarAndNavbarLayout, this, 0);
      },

      _handleLoginSuccess(username) {
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
        if (this._sidebar) {
          this._sidebar.setSidebarSubtitle(`Signed in as ${username}`);
        }
      },

      _handleLogout() {
        // Close all windows
        if (this._windowManager) {
          this._windowManager.closeAllWindows();
        }
        
        // Hide main application
        this._mainContainer.setVisibility("hidden");
        
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

      _handleSubmit() {
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
        const normalizeYearLevel = (yearLevel) => {
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

      _handleCancel() {
        this._personalInfoWindow.clear();
        this._contactInfoWindow.clear();
        this._academicInfoWindow.clear();
        this._statusLabel.setValue("All form fields cleared");
      },

      // Public method to get window manager (for menu bar access)
      getWindowManager() {
        return this._windowManager;
      },

      // Toggle dark mode theme
      toggleTheme() {
        document.documentElement.classList.toggle("dark");
      }
    }
  });
