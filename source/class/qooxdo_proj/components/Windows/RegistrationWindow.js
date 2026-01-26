/* ************************************************************************

   Copyright: 2026 

   License: MIT license

   Authors: 

************************************************************************ */

qx.Class.define("qooxdo_proj.components.Windows.RegistrationWindow", {
  extend: qx.ui.window.Window,

  events: {
    /** Fired when registration is successful. Data: {username: string} */
    registrationSuccess: "qx.event.type.Data",
  },

  construct: function () {
    this.base(arguments, "Sign Up");
    
    this.setLayout(new qx.ui.layout.VBox(15));
    this.setWidth(450);
    this.setHeight(350);
    this.setAllowClose(true);
    this.setAllowMaximize(false);
    this.setAllowMinimize(true);
    this.setResizable(false);
    this.setMovable(true);
    this.center();

    // Title
    const title = new qooxdo_proj.components.ui.Label(
      "Create New Account",
    );
    title.setFont("bold");
    this.add(title);

    // Username field - label and input on same line
    const usernameContainer = new qx.ui.container.Composite();
    usernameContainer.setLayout(new qx.ui.layout.HBox(10));
    const usernameLabel = new qooxdo_proj.components.ui.Label("Username:");
    usernameLabel.setWidth(100);
    this._usernameField = new qooxdo_proj.components.ui.TextField();
    this._usernameField.setPlaceholder("Enter username");
    usernameContainer.add(usernameLabel);
    usernameContainer.add(this._usernameField, { flex: 1 });
    this.add(usernameContainer);

    // Password field - label and input on same line
    const passwordContainer = new qx.ui.container.Composite();
    passwordContainer.setLayout(new qx.ui.layout.HBox(10));
    const passwordLabel = new qooxdo_proj.components.ui.Label("Password:");
    passwordLabel.setWidth(100);
    this._passwordField = new qooxdo_proj.components.ui.PasswordField();
    this._passwordField.setPlaceholder("Enter password");
    passwordContainer.add(passwordLabel);
    passwordContainer.add(this._passwordField, { flex: 1 });
    this.add(passwordContainer);

    // Error message label
    this._errorLabel = new qooxdo_proj.components.ui.Label("");
    this._errorLabel.setRich(true);
    this._errorLabel.setVisibility("hidden");
    this.add(this._errorLabel);

    // Button container
    const buttonContainer = new qx.ui.container.Composite();
    buttonContainer.setLayout(new qx.ui.layout.HBox(10));
    
    // Register button
    this._registerButton = new qooxdo_proj.components.ui.Button(
      "Register",
      "primary",
      "sm",
    );
    
    // Cancel button
    this._cancelButton = new qooxdo_proj.components.ui.Button(
      "Cancel",
      "secondary",
      "sm",
    );

    // Add Enter key listener to password field
    this._passwordField.addListener(
      "keypress",
      (e) => {
        if (e.getKeyIdentifier() === "Enter") {
          this._handleRegister();
        }
      },
      this,
    );

    // Register button handler
    this._registerButton.addListener(
      "execute",
      () => {
        this._handleRegister();
      },
      this,
    );

    // Cancel button handler
    this._cancelButton.addListener(
      "execute",
      () => {
        this.close();
      },
      this,
    );

    buttonContainer.add(this._registerButton, { flex: 1 });
    buttonContainer.add(this._cancelButton, { flex: 1 });
    this.add(buttonContainer);
  },

  members: {
    _usernameField: null,
    _passwordField: null,
    _registerButton: null,
    _cancelButton: null,
    _errorLabel: null,
    _isSubmitting: false,

    /**
     * Handle registration attempt
     */
    _handleRegister: function () {
      // Prevent duplicate submissions
      if (this._isSubmitting) {
        return;
      }

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

      // Set submitting flag and disable register button
      this._isSubmitting = true;
      this._registerButton.setEnabled(false);

      // Send registration request to API using fetch
      fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username: username, password: password })
      })
      .then(async response => {
        // Parse JSON response first
        let result;
        try {
          result = await response.json();
        } catch (parseError) {
          console.error("Failed to parse response:", parseError);
          throw new Error("Invalid response from server");
        }

        // Check if response is ok (status 200-299)
        // Note: 201 (Created) is also considered successful
        if (!response.ok) {
          // Response is not ok, but we have parsed JSON
          const errorMessage = result.error || this._getUserFriendlyError(response.status);
          throw new Error(errorMessage);
        }

        // Response is ok, return the parsed result
        return result;
      })
      .then(result => {
        // Check if registration was successful
        if (result && result.success) {
          // Registration successful
          this._showError('<span style="color: green;">Registration successful! You can now login.</span>');
          this._registerButton.setEnabled(true);
          this._isSubmitting = false;
          
          // Fire success event after a short delay
          qx.event.Timer.once(() => {
            const regUsername = result.user ? result.user.username : username;
            this.fireDataEvent("registrationSuccess", { username: regUsername });
            this.close();
          }, this, 1500);
        } else {
          // Registration failed - check if there's an error message
          const errorMsg = result.error || result.message || "Registration failed. Please try again.";
          this._showError(errorMsg);
          this._registerButton.setEnabled(true);
          this._isSubmitting = false;
        }
      })
      .catch(error => {
        console.error("Registration error:", error);
        // Check if this is our custom error (which already has a user-friendly message)
        const friendlyMessage = error.message || this._getUserFriendlyError(error);
        this._showError(friendlyMessage);
        this._registerButton.setEnabled(true);
        this._isSubmitting = false;
      });
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
      this._isSubmitting = false;
      this._registerButton.setEnabled(true);
    },
  },
});
