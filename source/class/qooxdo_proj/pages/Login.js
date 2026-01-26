/* ************************************************************************

   Copyright: 2026 

   License: MIT license

   Authors: 

************************************************************************ */

qx.Class.define("qooxdo_proj.pages.Login", {
  extend: qx.ui.container.Composite,

  events: {
    /** Fired when login is successful. Data: {username: string} */
    loginSuccess: "qx.event.type.Data",
  },

  construct: function () {
    this.base(arguments);

    // Use Canvas layout for precise centering
    this.setLayout(new qx.ui.layout.Canvas());
    this.setPadding(0);
    this.setBackgroundColor("#f5f5f5");

    // Center container
    const centerContainer = new qx.ui.container.Composite();
    centerContainer.setLayout(new qx.ui.layout.VBox(15));
    centerContainer.setPadding(30);
    centerContainer.setBackgroundColor("white");
    centerContainer.setDecorator("main");
    centerContainer.setWidth(500);
    centerContainer.setMinWidth(500);
    centerContainer.setMaxWidth(500);

    // Title
    const title = new qooxdo_proj.components.ui.Label(
      "Student Registration System",
    );
    title.setFont("bold");
    centerContainer.add(title);

    // Subtitle
    const subtitle = new qooxdo_proj.components.ui.Label(
      "Please login to continue",
    );
    centerContainer.add(subtitle);

    // Username field - label and input on same line
    const usernameContainer = new qx.ui.container.Composite();
    usernameContainer.setLayout(new qx.ui.layout.HBox(10));
    const usernameLabel = new qooxdo_proj.components.ui.Label("Username:");
    usernameLabel.setWidth(100); // Fixed width for alignment
    this._usernameField = new qooxdo_proj.components.ui.TextField();
    this._usernameField.setPlaceholder("Enter username");
    usernameContainer.add(usernameLabel);
    usernameContainer.add(this._usernameField, { flex: 1 });
    centerContainer.add(usernameContainer);

    // Password field - label and input on same line
    const passwordContainer = new qx.ui.container.Composite();
    passwordContainer.setLayout(new qx.ui.layout.HBox(10));
    const passwordLabel = new qooxdo_proj.components.ui.Label("Password:");
    passwordLabel.setWidth(100); // Fixed width for alignment
    this._passwordField = new qooxdo_proj.components.ui.PasswordField();
    this._passwordField.setPlaceholder("Enter password");
    passwordContainer.add(passwordLabel);
    passwordContainer.add(this._passwordField, { flex: 1 });
    centerContainer.add(passwordContainer);

    // Error message label
    this._errorLabel = new qooxdo_proj.components.ui.Label("");
    this._errorLabel.setRich(true); // Enable rich text for color styling
    this._errorLabel.setVisibility("hidden");
    centerContainer.add(this._errorLabel);

    // Login button
    // this._loginButton = new qx.ui.form.Button("Login");
    this._loginButton = new qooxdo_proj.components.ui.Button(
      "Login",
      "primary",
      "sm",
    );

    // Add Enter key listener to password field
    this._passwordField.addListener(
      "keypress",
      (e) => {
        if (e.getKeyIdentifier() === "Enter") {
          this._handleLogin();
        }
      },
      this,
    );

    // Login button handler
    this._loginButton.addListener(
      "execute",
      () => {
        this._handleLogin();
      },
      this,
    );

    // Sign up button
    this._signUpButton = new qooxdo_proj.components.ui.Button(
      "Sign up",
      "secondary",
      "sm",
    );
    // Set negative top margin to reduce space from login button
    this._signUpButton.setMarginTop(-8);

    // Sign up button handler - opens registration window
    this._signUpButton.addListener(
      "execute",
      () => {
        this._openRegistrationWindow();
      },
      this,
    );

    // Container for buttons with minimal spacing
    const buttonContainer = new qx.ui.container.Composite();
    buttonContainer.setLayout(new qx.ui.layout.VBox(0));
    buttonContainer.add(this._loginButton);
    buttonContainer.add(this._signUpButton);
    centerContainer.add(buttonContainer);

    // Center the container using Canvas layout with integer positions
    const self = this;
    const updatePosition = () => {
      const containerWidth = 320;
      let containerHeight = 350; // Default height

      // Try to get actual height
      try {
        const bounds = centerContainer.getBounds();
        if (bounds && bounds.height) {
          containerHeight = bounds.height;
        }
      } catch (e) {
        // Use default
      }

      // Get dimensions from the login page itself (which should fill the root)
      let rootWidth = window.innerWidth;
      let rootHeight = window.innerHeight;

      try {
        const selfBounds = self.getBounds();
        if (selfBounds) {
          rootWidth = selfBounds.width || rootWidth;
          rootHeight = selfBounds.height || rootHeight;
        }
      } catch (e) {
        // Use window dimensions as fallback
      }

      // If still no dimensions, try root
      if (rootWidth === window.innerWidth) {
        try {
          const root = self.getRoot();
          if (root) {
            const rootBounds = root.getBounds();
            if (rootBounds) {
              rootWidth = rootBounds.width || rootWidth;
              rootHeight = rootBounds.height || rootHeight;
            }
          }
        } catch (e) {
          // Keep window dimensions
        }
      }

      // Calculate center position and round to integers (required by Canvas layout)
      const left = Math.round((rootWidth - containerWidth) / 2);
      const top = Math.round((rootHeight - containerHeight) / 2);

      // Update layout properties with integer values
      centerContainer.setLayoutProperties({
        left: Math.max(0, left),
        top: Math.max(0, top),
      });
    };

    // Add container to layout
    this.add(centerContainer);

    // Update position on resize and appear
    this.addListener("resize", updatePosition, this);
    this.addListener("appear", updatePosition, this);

    // Initial positioning with delays to ensure layout is ready
    qx.event.Timer.once(updatePosition, this, 0);
    qx.event.Timer.once(updatePosition, this, 100);
    qx.event.Timer.once(updatePosition, this, 300);
  },
  members: {
    _usernameField: null,
    _passwordField: null,
    _loginButton: null,
    _signUpButton: null,
    _errorLabel: null,
    _registrationWindow: null,

    /**
     * Handle login attempt
     */
    _handleLogin: function () {
      const username = this._usernameField.getValue() || "";
      const password = this._passwordField.getValue() || "";

      // Clear previous error
      this._errorLabel.setVisibility("hidden");
      this._errorLabel.setValue("");

      // Validate inputs
      if (!username.trim()) {
        this._showError("Please enter a username");
        return;
      }

      if (!password.trim()) {
        this._showError("Please enter a password");
        return;
      }

      // Disable login button during validation
      this._loginButton.setEnabled(false);

      // Send login request to API using fetch
      fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username: username, password: password })
      })
      .then(response => {
        // Check if response is ok (status 200-299)
        if (!response.ok) {
          // Try to parse error message from response
          return response.json().then(errorData => {
            const errorMessage = errorData.error || this._getUserFriendlyError(response.status);
            throw new Error(errorMessage);
          }).catch(() => {
            throw new Error(this._getUserFriendlyError(response.status));
          });
        }
        return response.json();
      })
      .then(result => {
        if (result && result.success) {
          // Login successful
          this.fireDataEvent("loginSuccess", { username: result.username });
        } else {
          // Login failed
          this._showError(result.error || "Invalid username or password");
          this._loginButton.setEnabled(true);
        }
      })
      .catch(error => {
        console.error("Login error:", error);
        const friendlyMessage = this._getUserFriendlyError(error.message);
        this._showError(friendlyMessage);
        this._loginButton.setEnabled(true);
      });
    },

    /**
     * Open registration window
     */
    _openRegistrationWindow: function () {
      // If window already exists and is open, just bring it to front
      if (this._registrationWindow && this._registrationWindow.isVisible()) {
        this._registrationWindow.toFront();
        return;
      }

      // Create new registration window
      this._registrationWindow = new qooxdo_proj.components.Windows.RegistrationWindow();
      
      // Get root from application instance
      const app = qx.core.Init.getApplication();
      if (app && app.getRoot) {
        const root = app.getRoot();
        root.add(this._registrationWindow);
      } else {
        // Fallback: find root by traversing up the widget tree
        let widget = this;
        while (widget) {
          const parent = widget.getLayoutParent ? widget.getLayoutParent() : null;
          if (!parent) {
            // This is likely the root or a top-level widget
            break;
          }
          widget = parent;
        }
        // Try to add to the found widget or use document body as last resort
        if (widget && widget.add) {
          widget.add(this._registrationWindow);
        }
      }
      
      // Center the window
      this._registrationWindow.center();
      
      // Open the window
      this._registrationWindow.open();
      
      // Listen for successful registration
      this._registrationWindow.addListener("registrationSuccess", (e) => {
        const data = e.getData();
        // Clear login form and show success message
        this.clear();
        this._showError('<span style="color: green;">Registration successful! Please login with your new account.</span>');
      }, this);
      
      // Clear form when window closes
      this._registrationWindow.addListener("close", () => {
        if (this._registrationWindow) {
          this._registrationWindow.clear();
        }
      }, this);
    },

    /**
     * Convert technical error messages to user-friendly messages
     * @param {String|Number} error - Error message or status code
     * @return {String} User-friendly error message
     */
    _getUserFriendlyError: function (error) {
      // If it's a number, it's likely an HTTP status code
      if (typeof error === 'number') {
        const statusMessages = {
          400: "Invalid request. Please check your input and try again.",
          401: "Invalid username or password. Please try again.",
          403: "Access denied. Please contact support if you believe this is an error.",
          404: "Service not found. Please try again later.",
          409: "This username is already taken. Please choose a different one.",
          422: "Invalid information provided. Please check your input.",
          500: "Server error. Please try again later.",
          503: "Service temporarily unavailable. Please try again later."
        };
        return statusMessages[error] || "An error occurred. Please try again.";
      }

      // If it's a string error message, check for common technical messages
      const errorStr = String(error);
      
      // Network errors
      if (errorStr.includes("Failed to fetch") || 
          errorStr.includes("NetworkError") ||
          errorStr.includes("Network request failed")) {
        return "Unable to connect to the server. Please check your internet connection and try again.";
      }

      // Server error patterns
      if (errorStr.includes("Server error: 401") || errorStr.includes("401")) {
        return "Invalid username or password. Please try again.";
      }
      if (errorStr.includes("Server error: 400") || errorStr.includes("400")) {
        return "Invalid request. Please check your input and try again.";
      }
      if (errorStr.includes("Server error: 500") || errorStr.includes("500")) {
        return "Server error. Please try again later.";
      }
      if (errorStr.includes("Server error:")) {
        return "An error occurred. Please try again.";
      }

      // If the error message is already user-friendly (doesn't contain technical terms), return as-is
      if (!errorStr.includes("error:") && 
          !errorStr.includes("status") && 
          !errorStr.includes("fetch") &&
          !errorStr.includes("Network")) {
        return errorStr;
      }

      // Default fallback
      return "An unexpected error occurred. Please try again.";
    },

    /**
     * Show error message
     * @param {String} message - Error message (can contain HTML)
     */
    _showError: function (message) {
      // If message already contains HTML styling, use it as-is, otherwise wrap in red
      if (message.includes('<span')) {
        this._errorLabel.setValue(message);
      } else {
        this._errorLabel.setValue('<span style="color: red;">' + message + '</span>');
      }
      // Make visible - this will allow the label to size naturally
      this._errorLabel.setVisibility("visible");
    },

    /**
     * Clear form
     */
    clear: function () {
      this._usernameField.setValue("");
      this._passwordField.setValue("");
      this._errorLabel.setValue("");
      this._errorLabel.setVisibility("hidden");
    },
  },
});
