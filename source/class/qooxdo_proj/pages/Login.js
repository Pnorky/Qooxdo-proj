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
    this._errorLabel.setVisibility("hidden"); 
    this._errorLabel.setHeight(0); // Don't take up space when hidden
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

    centerContainer.add(this._loginButton);

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
    _errorLabel: null,

    /**
     * Handle login attempt
     */
    _handleLogin: function () {
      const username = this._usernameField.getValue() || "";
      const password = this._passwordField.getValue() || "";

      // Clear previous error
      this._errorLabel.setVisibility("hidden");
      this._errorLabel.setValue("");
      this._errorLabel.setHeight(0); // Don't take up space when hidden

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

      // Simulate login
      setTimeout(() => {
        if (this._validateLogin(username, password)) {
          // Login successful
          this.fireDataEvent("loginSuccess", { username: username });
        } else {
          // Login failed
          this._showError("Invalid username or password");
          this._loginButton.setEnabled(true);
        }
      }, 500);
    },

    /**
     * Validate login credentials
     * @param {String} username - Username
     * @param {String} password - Password
     * @return {Boolean} True if valid
     */
    _validateLogin: function (username, password) {
      return username.trim().length > 0 && password.trim().length > 0;
    },

    /**
     * Show error message
     * @param {String} message - Error message
     */
    _showError: function (message) {
      this._errorLabel.setValue(message);
      this._errorLabel.setVisibility("visible");
      this._errorLabel.setHeight(null); // Restore default height when visible
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
