/* ************************************************************************

   Copyright: 2026 

   License: MIT license

   Authors: 

************************************************************************ */

qx.Class.define("qooxdo_proj.components.Tabs.StudentInfoTable",
  {
    extend: qx.ui.tabview.Page,

    construct: function () {
      this.base(arguments, "Student Info Table");
      this.setLayout(new qx.ui.layout.VBox(10));
      this.setPadding(10);
      this._createTable();
      this._createWindows();
    },

    members:
    {
      _table: null,
      _studentRowNumber: 0,
      _studentsData: [], // Store full student data indexed by row
      _editWindow: null,
      _deleteWindow: null,
      _currentStudent: null,

      /**
       * Extract numeric part from yearLevel string
       * Handles formats like "p4", "rr3", "r2", "4", "1st Year", "2nd Year", etc.
       * @param {String|Number} yearLevel - Year level value
       * @return {String} Numeric year level (1-4) or empty string
       */
      _normalizeYearLevel: function (yearLevel) {
        if (!yearLevel) return "";
        
        // If it's already a number, convert to string
        if (typeof yearLevel === 'number') {
          return String(yearLevel);
        }
        
        const str = String(yearLevel).trim();
        if (!str) return "";
        
        // Extract the last digit from the string
        const match = str.match(/(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          // Ensure it's between 1-4 (valid year levels)
          if (num >= 1 && num <= 4) {
            return String(num);
          }
        }
        
        return str; // Return original if no valid number found
      },

      /**
       * Convert numeric yearLevel to ComboBox format ("1st Year", "2nd Year", etc.)
       * @param {String|Number} yearLevel - Numeric year level (1-4)
       * @return {String} Formatted year level or empty string
       */
      _formatYearLevelForComboBox: function (yearLevel) {
        const normalized = this._normalizeYearLevel(yearLevel);
        if (!normalized) return "";
        
        const num = parseInt(normalized, 10);
        if (num >= 1 && num <= 4) {
          const suffixes = ["", "st", "nd", "rd", "th"];
          return num + suffixes[num] + " Year";
        }
        return normalized;
      },

      _createTable: function () {
        // Create custom Table component with Basecoat UI styling
        this._table = new qooxdo_proj.components.ui.Table("");
        
        // Set table headers
        const columnNames = ["#", "Student Id", "First Name", "Last Name", "Program", "Year Level"];
        this._table.setHeaders(columnNames);

        // Set table size
        this._table.set({
          width: 800,
          height: 400
        });

        // Listen to row click events
        this._table.addListener("rowClick", (e) => {
          const data = e.getData();
          this._handleRowClick(data.rowIndex, data.rowData);
        }, this);

        this.add(this._table, { flex: 1 });
      },

      _createWindows: function () {
        // Create edit window - larger to accommodate all fields
        this._editWindow = new qx.ui.window.Window("Edit Student");
        this._editWindow.setLayout(new qx.ui.layout.VBox(10));
        this._editWindow.setWidth(700);
        this._editWindow.setHeight(700);
        this._editWindow.setAllowClose(true);
        this._editWindow.setAllowMaximize(false);
        this._editWindow.setAllowMinimize(false);
        this._editWindow.setResizable(true);
        this._editWindow.setMovable(true);
        this._editWindow.setShowClose(true);
        this._editWindow.setShowMaximize(false);
        this._editWindow.setShowMinimize(false);
        
        // Create delete confirmation window
        this._deleteWindow = new qx.ui.window.Window("Delete Student");
        this._deleteWindow.setLayout(new qx.ui.layout.VBox(15));
        this._deleteWindow.setWidth(500);
        this._deleteWindow.setHeight(220);
        this._deleteWindow.setAllowClose(true);
        this._deleteWindow.setAllowMaximize(false);
        this._deleteWindow.setAllowMinimize(false);
        this._deleteWindow.setResizable(false);
        this._deleteWindow.setMovable(true);
        this._deleteWindow.setShowClose(true);
        this._deleteWindow.setShowMaximize(false);
        this._deleteWindow.setShowMinimize(false);
        this._deleteWindow.setPadding(20);
        
        // Add windows to root
        const root = qx.core.Init.getApplication().getRoot();
        if (root) {
          root.add(this._editWindow);
          root.add(this._deleteWindow);
        }
      },

      _handleRowClick: function (rowIndex, rowData) {
        // Check if rowIndex is valid
        if (rowIndex < 0 || rowIndex >= this._studentsData.length) {
          return;
        }

        // Get student from _studentsData array (more reliable than rowData)
        const student = this._studentsData[rowIndex];
        if (!student) {
          return;
        }

        this._currentStudent = student;

        // Show edit dialog
        this._showEditDialog(student);
      },

      _showEditDialog: function (student) {
        // Debug: Log student data to see what we're working with
        console.log("[DEBUG] Student data for edit:", student);
        
        // Clear previous content
        this._editWindow.removeAll();

        // Create description label
        const descriptionLabel = new qooxdo_proj.components.ui.Label("Update student information below.");
        this._editWindow.add(descriptionLabel);

        // Create scrollable container for the form
        const scrollContainer = new qx.ui.container.Scroll();
        scrollContainer.set({
          width: 680,
          height: 550
        });

        // Create form grid with proper column widths
        const formGrid = new qx.ui.container.Composite();
        const gridLayout = new qx.ui.layout.Grid(10, 10);
        // Set column flex: label column fixed width, input column flexible
        gridLayout.setColumnFlex(0, 0); // Label column (fixed width based on content)
        gridLayout.setColumnFlex(1, 1); // Input column (flexible, fills remaining space)
        formGrid.setLayout(gridLayout);
        formGrid.setPadding(10);
        
        // Set minimum width on labels for consistent alignment
        const labelWidth = 180;
        let currentRow = 0;

        // ========== PERSONAL INFORMATION SECTION ==========
        const personalInfoLabel = new qooxdo_proj.components.ui.Label("Personal Information");
        personalInfoLabel.setFont("bold");
        formGrid.add(personalInfoLabel, { row: currentRow++, column: 0, colSpan: 2 });

        // Student ID field
        const studentIdLabel = new qooxdo_proj.components.ui.Label("Student ID:");
        studentIdLabel.setWidth(labelWidth);
        const studentIdField = new qooxdo_proj.components.ui.TextField();
        // Set value after widget appears
        studentIdField.addListenerOnce("appear", () => {
          studentIdField.setValue(student.studentId || "");
        }, this);
        formGrid.add(studentIdLabel, { row: currentRow, column: 0 });
        formGrid.add(studentIdField, { row: currentRow++, column: 1 });

        // First Name field
        const firstNameLabel = new qooxdo_proj.components.ui.Label("First Name:");
        firstNameLabel.setWidth(labelWidth);
        const firstNameField = new qooxdo_proj.components.ui.TextField();
        // Set value after widget appears
        firstNameField.addListenerOnce("appear", () => {
          firstNameField.setValue(student.firstName || "");
        }, this);
        formGrid.add(firstNameLabel, { row: currentRow, column: 0 });
        formGrid.add(firstNameField, { row: currentRow++, column: 1 });

        // Last Name field
        const lastNameLabel = new qooxdo_proj.components.ui.Label("Last Name:");
        lastNameLabel.setWidth(labelWidth);
        const lastNameField = new qooxdo_proj.components.ui.TextField();
        // Set value after widget appears
        lastNameField.addListenerOnce("appear", () => {
          lastNameField.setValue(student.lastName || "");
        }, this);
        formGrid.add(lastNameLabel, { row: currentRow, column: 0 });
        formGrid.add(lastNameField, { row: currentRow++, column: 1 });

        // Date of Birth field
        const dobLabel = new qooxdo_proj.components.ui.Label("Date of Birth:");
        dobLabel.setWidth(labelWidth);
        const dobField = new qooxdo_proj.components.ui.DateField();
        dobField.setMaxWidth(200);
        if (student.dateOfBirth) {
          dobField.setValue(new Date(student.dateOfBirth));
        }
        formGrid.add(dobLabel, { row: currentRow, column: 0 });
        formGrid.add(dobField, { row: currentRow++, column: 1 });

        // Gender field
        const genderLabel = new qooxdo_proj.components.ui.Label("Gender:");
        genderLabel.setWidth(labelWidth);
        const genderField = new qooxdo_proj.components.ui.ComboBox();
        genderField.add(new qx.ui.form.ListItem("Male"));
        genderField.add(new qx.ui.form.ListItem("Female"));
        if (student.gender) {
          genderField.setValue(student.gender);
        }
        formGrid.add(genderLabel, { row: currentRow, column: 0 });
        formGrid.add(genderField, { row: currentRow++, column: 1 });

        // Address field
        const addressLabel = new qooxdo_proj.components.ui.Label("Address:");
        addressLabel.setWidth(labelWidth);
        const addressField = new qooxdo_proj.components.ui.TextArea();
        addressField.setHeight(80);
        // Set value after widget appears
        addressField.addListenerOnce("appear", () => {
          addressField.setValue(student.address || "");
        }, this);
        formGrid.add(addressLabel, { row: currentRow, column: 0 });
        formGrid.add(addressField, { row: currentRow++, column: 1 });

        // ========== CONTACT INFORMATION SECTION ==========
        const contactInfoLabel = new qooxdo_proj.components.ui.Label("Contact Information");
        contactInfoLabel.setFont("bold");
        formGrid.add(contactInfoLabel, { row: currentRow++, column: 0, colSpan: 2 });

        // Email field
        const emailLabel = new qooxdo_proj.components.ui.Label("Email:");
        emailLabel.setWidth(labelWidth);
        const emailField = new qooxdo_proj.components.ui.TextField();
        emailField.addListenerOnce("appear", () => {
          emailField.setValue(student.email || "");
        }, this);
        formGrid.add(emailLabel, { row: currentRow, column: 0 });
        formGrid.add(emailField, { row: currentRow++, column: 1 });

        // Personal Phone field
        const personalPhoneLabel = new qooxdo_proj.components.ui.Label("Personal Phone:");
        personalPhoneLabel.setWidth(labelWidth);
        const personalPhoneField = new qooxdo_proj.components.ui.TextField();
        personalPhoneField.addListenerOnce("appear", () => {
          personalPhoneField.setValue(student.personalPhone || "");
        }, this);
        formGrid.add(personalPhoneLabel, { row: currentRow, column: 0 });
        formGrid.add(personalPhoneField, { row: currentRow++, column: 1 });

        // Emergency Contact field
        const emergencyContactLabel = new qooxdo_proj.components.ui.Label("Emergency Contact:");
        emergencyContactLabel.setWidth(labelWidth);
        const emergencyContactField = new qooxdo_proj.components.ui.TextField();
        emergencyContactField.addListenerOnce("appear", () => {
          emergencyContactField.setValue(student.emergencyContact || "");
        }, this);
        formGrid.add(emergencyContactLabel, { row: currentRow, column: 0 });
        formGrid.add(emergencyContactField, { row: currentRow++, column: 1 });

        // Emergency Contact Phone field
        const emergencyContactPhoneLabel = new qooxdo_proj.components.ui.Label("Emergency Contact Phone:");
        emergencyContactPhoneLabel.setWidth(labelWidth);
        const emergencyContactPhoneField = new qooxdo_proj.components.ui.TextField();
        emergencyContactPhoneField.addListenerOnce("appear", () => {
          emergencyContactPhoneField.setValue(student.emergencyContactPhone || "");
        }, this);
        formGrid.add(emergencyContactPhoneLabel, { row: currentRow, column: 0 });
        formGrid.add(emergencyContactPhoneField, { row: currentRow++, column: 1 });

        // Relationship field
        const relationshipLabel = new qooxdo_proj.components.ui.Label("Relationship:");
        relationshipLabel.setWidth(labelWidth);
        const relationshipField = new qooxdo_proj.components.ui.TextField();
        relationshipField.addListenerOnce("appear", () => {
          relationshipField.setValue(student.relationship || "");
        }, this);
        formGrid.add(relationshipLabel, { row: currentRow, column: 0 });
        formGrid.add(relationshipField, { row: currentRow++, column: 1 });

        // ========== ACADEMIC INFORMATION SECTION ==========
        const academicInfoLabel = new qooxdo_proj.components.ui.Label("Academic Information");
        academicInfoLabel.setFont("bold");
        formGrid.add(academicInfoLabel, { row: currentRow++, column: 0, colSpan: 2 });

        // Program field
        const programLabel = new qooxdo_proj.components.ui.Label("Program:");
        programLabel.setWidth(labelWidth);
        const programField = new qooxdo_proj.components.ui.ComboBox();
        programField.add(new qx.ui.form.ListItem("Bachelor of Science in Computer Science"));
        programField.add(new qx.ui.form.ListItem("Bachelor of Science in Information Technology"));
        programField.add(new qx.ui.form.ListItem("Bachelor of Science in Information Systems"));
        programField.add(new qx.ui.form.ListItem("Bachelor of Science in Business Administration"));
        programField.add(new qx.ui.form.ListItem("Bachelor of Science in Accounting"));
        programField.add(new qx.ui.form.ListItem("Bachelor of Science in Marketing"));
        programField.add(new qx.ui.form.ListItem("Bachelor of Science in Management"));
        if (student.program) {
          programField.setValue(student.program);
        }
        formGrid.add(programLabel, { row: currentRow, column: 0 });
        formGrid.add(programField, { row: currentRow++, column: 1 });

        // Year Level field
        const yearLevelLabel = new qooxdo_proj.components.ui.Label("Year Level:");
        yearLevelLabel.setWidth(labelWidth);
        const yearLevelField = new qooxdo_proj.components.ui.ComboBox();
        yearLevelField.add(new qx.ui.form.ListItem("1st Year"));
        yearLevelField.add(new qx.ui.form.ListItem("2nd Year"));
        yearLevelField.add(new qx.ui.form.ListItem("3rd Year"));
        yearLevelField.add(new qx.ui.form.ListItem("4th Year"));
        if (student.yearLevel) {
          // Normalize and format yearLevel for ComboBox
          const formattedYearLevel = this._formatYearLevelForComboBox(student.yearLevel);
          if (formattedYearLevel) {
            yearLevelField.setValue(formattedYearLevel);
          }
        }
        formGrid.add(yearLevelLabel, { row: currentRow, column: 0 });
        formGrid.add(yearLevelField, { row: currentRow++, column: 1 });

        // ========== PREVIOUS SCHOOLS SECTION ==========
        const previousSchoolLabel = new qooxdo_proj.components.ui.Label("Previous Schools Attended");
        previousSchoolLabel.setFont("bold");
        formGrid.add(previousSchoolLabel, { row: currentRow++, column: 0, colSpan: 2 });

        // Grade School field
        const gradeSchoolLabel = new qooxdo_proj.components.ui.Label("Grade School:");
        gradeSchoolLabel.setWidth(labelWidth);
        const gradeSchoolField = new qooxdo_proj.components.ui.TextField();
        gradeSchoolField.addListenerOnce("appear", () => {
          gradeSchoolField.setValue(student.gradeSchool || "");
        }, this);
        formGrid.add(gradeSchoolLabel, { row: currentRow, column: 0 });
        formGrid.add(gradeSchoolField, { row: currentRow++, column: 1 });

        // High School field
        const highSchoolLabel = new qooxdo_proj.components.ui.Label("High School:");
        highSchoolLabel.setWidth(labelWidth);
        const highSchoolField = new qooxdo_proj.components.ui.TextField();
        highSchoolField.addListenerOnce("appear", () => {
          highSchoolField.setValue(student.highSchool || "");
        }, this);
        formGrid.add(highSchoolLabel, { row: currentRow, column: 0 });
        formGrid.add(highSchoolField, { row: currentRow++, column: 1 });

        // College field
        const collegeLabel = new qooxdo_proj.components.ui.Label("College:");
        collegeLabel.setWidth(labelWidth);
        const collegeField = new qooxdo_proj.components.ui.TextField();
        collegeField.addListenerOnce("appear", () => {
          collegeField.setValue(student.college || "");
        }, this);
        formGrid.add(collegeLabel, { row: currentRow, column: 0 });
        formGrid.add(collegeField, { row: currentRow++, column: 1 });

        // Add form grid to scroll container
        scrollContainer.add(formGrid);
        this._editWindow.add(scrollContainer, { flex: 1 });

        // Set values after widgets are added to ensure they render properly
        // Use a small delay to ensure DOM is ready
        qx.event.Timer.once(() => {
          console.log("[DEBUG] Setting field values after rendering, student data:", student);
          
          // Re-set all values after rendering to ensure they display
          if (student.studentId) {
            studentIdField.setValue(student.studentId);
            console.log("[DEBUG] Set studentId:", student.studentId);
          }
          
          if (student.firstName) {
            firstNameField.setValue(student.firstName);
            console.log("[DEBUG] Set firstName:", student.firstName);
          }
          
          if (student.lastName) {
            lastNameField.setValue(student.lastName);
            console.log("[DEBUG] Set lastName:", student.lastName);
          }
          
          // Date of Birth
          if (student.dateOfBirth) {
            try {
              const dobDate = new Date(student.dateOfBirth);
              if (!isNaN(dobDate.getTime())) {
                dobField.setValue(dobDate);
                console.log("[DEBUG] Set dateOfBirth:", student.dateOfBirth);
              }
            } catch (e) {
              console.warn("Error parsing dateOfBirth:", e);
            }
          }
          
          // Gender
          if (student.gender) {
            genderField.setValue(student.gender);
            console.log("[DEBUG] Set gender:", student.gender);
          }
          
          if (student.address) {
            addressField.setValue(student.address);
            console.log("[DEBUG] Set address:", student.address);
          }
          
          if (student.email) {
            emailField.setValue(student.email);
            console.log("[DEBUG] Set email:", student.email);
          }
          
          if (student.personalPhone) {
            personalPhoneField.setValue(student.personalPhone);
            console.log("[DEBUG] Set personalPhone:", student.personalPhone);
          }
          
          if (student.emergencyContact) {
            emergencyContactField.setValue(student.emergencyContact);
            console.log("[DEBUG] Set emergencyContact:", student.emergencyContact);
          }
          
          if (student.emergencyContactPhone) {
            emergencyContactPhoneField.setValue(student.emergencyContactPhone);
            console.log("[DEBUG] Set emergencyContactPhone:", student.emergencyContactPhone);
          }
          
          if (student.relationship) {
            relationshipField.setValue(student.relationship);
            console.log("[DEBUG] Set relationship:", student.relationship);
          }
          
          // Program
          if (student.program) {
            programField.setValue(student.program);
            console.log("[DEBUG] Set program:", student.program);
          }
          
          // Year Level
          if (student.yearLevel) {
            // Normalize and format yearLevel for ComboBox
            const formattedYearLevel = this._formatYearLevelForComboBox(student.yearLevel);
            if (formattedYearLevel) {
              yearLevelField.setValue(formattedYearLevel);
              console.log("[DEBUG] Set yearLevel:", formattedYearLevel, "(from:", student.yearLevel + ")");
            }
          }
          
          if (student.gradeSchool) {
            gradeSchoolField.setValue(student.gradeSchool);
            console.log("[DEBUG] Set gradeSchool:", student.gradeSchool);
          }
          
          if (student.highSchool) {
            highSchoolField.setValue(student.highSchool);
            console.log("[DEBUG] Set highSchool:", student.highSchool);
          }
          
          if (student.college) {
            collegeField.setValue(student.college);
            console.log("[DEBUG] Set college:", student.college);
          }
          
          console.log("[DEBUG] All values set after rendering");
        }, this, 150);

        // Create button container
        const buttonContainer = new qx.ui.container.Composite();
        buttonContainer.setLayout(new qx.ui.layout.HBox(10));
        buttonContainer.setPadding(10);

        // Add buttons - Save, Cancel, Delete
        const saveButton = new qooxdo_proj.components.ui.Button("Save", "");
        saveButton.addListener("execute", () => {
          this._editWindow.close();
          // Get date value - convert Date object to string if needed
          let dateOfBirthValue = null;
          const dobValue = dobField.getValue();
          if (dobValue) {
            if (dobValue instanceof Date) {
              dateOfBirthValue = dobValue.toISOString().split('T')[0];
            } else {
              dateOfBirthValue = dobValue;
            }
          }
          
          // Get gender value
          let genderValue = "";
          const genderSelection = genderField.getSelection();
          if (genderSelection && genderSelection.length > 0) {
            genderValue = genderSelection[0].getLabel();
          } else {
            genderValue = genderField.getValue() || "";
          }
          
          this._saveStudent(student.id, {
            studentId: studentIdField.getValue(),
            firstName: firstNameField.getValue(),
            lastName: lastNameField.getValue(),
            dateOfBirth: dateOfBirthValue,
            gender: genderValue,
            address: addressField.getValue() || "",
            email: emailField.getValue() || "",
            personalPhone: personalPhoneField.getValue() || "",
            emergencyContact: emergencyContactField.getValue() || "",
            emergencyContactPhone: emergencyContactPhoneField.getValue() || "",
            relationship: relationshipField.getValue() || "",
            program: programField.getValue() || "",
            yearLevel: this._normalizeYearLevel(yearLevelField.getValue()) || "",
            gradeSchool: gradeSchoolField.getValue() || "",
            highSchool: highSchoolField.getValue() || "",
            college: collegeField.getValue() || ""
          });
        }, this);

        const cancelButton = new qooxdo_proj.components.ui.Button("Cancel", "outline");
        cancelButton.addListener("execute", () => {
          this._editWindow.close();
        }, this);

        const deleteButton = new qooxdo_proj.components.ui.Button("Delete", "outline");
        deleteButton.addListener("execute", () => {
          this._editWindow.close();
          this._showDeleteDialog(student);
        }, this);

        buttonContainer.add(saveButton);
        buttonContainer.add(cancelButton);
        buttonContainer.add(deleteButton);

        this._editWindow.add(buttonContainer);

        // Store field references for later access
        this._editFields = {
          studentId: studentIdField,
          firstName: firstNameField,
          lastName: lastNameField,
          dob: dobField,
          gender: genderField,
          address: addressField,
          email: emailField,
          personalPhone: personalPhoneField,
          emergencyContact: emergencyContactField,
          emergencyContactPhone: emergencyContactPhoneField,
          relationship: relationshipField,
          program: programField,
          yearLevel: yearLevelField,
          gradeSchool: gradeSchoolField,
          highSchool: highSchoolField,
          college: collegeField
        };
        
        // Store student data for later use
        this._editStudentData = student;

        // Set values when window appears (ensures DOM is ready)
        this._editWindow.addListenerOnce("appear", () => {
          console.log("[DEBUG] Window appeared, setting values from student:", this._editStudentData);
          
          const s = this._editStudentData;
          const f = this._editFields;
          
          if (s.studentId) f.studentId.setValue(s.studentId);
          if (s.firstName) f.firstName.setValue(s.firstName);
          if (s.lastName) f.lastName.setValue(s.lastName);
          
          if (s.dateOfBirth) {
            try {
              const dobDate = new Date(s.dateOfBirth);
              if (!isNaN(dobDate.getTime())) {
                f.dob.setValue(dobDate);
              }
            } catch (e) {
              console.warn("Error parsing dateOfBirth:", e);
            }
          }
          
          if (s.gender) f.gender.setValue(s.gender);
          if (s.address) f.address.setValue(s.address);
          if (s.email) f.email.setValue(s.email);
          if (s.personalPhone) f.personalPhone.setValue(s.personalPhone);
          if (s.emergencyContact) f.emergencyContact.setValue(s.emergencyContact);
          if (s.emergencyContactPhone) f.emergencyContactPhone.setValue(s.emergencyContactPhone);
          if (s.relationship) f.relationship.setValue(s.relationship);
          if (s.program) f.program.setValue(s.program);
          if (s.yearLevel) {
            // Normalize and format yearLevel for ComboBox
            const formattedYearLevel = this._formatYearLevelForComboBox(s.yearLevel);
            if (formattedYearLevel) {
              f.yearLevel.setValue(formattedYearLevel);
            }
          }
          if (s.gradeSchool) f.gradeSchool.setValue(s.gradeSchool);
          if (s.highSchool) f.highSchool.setValue(s.highSchool);
          if (s.college) f.college.setValue(s.college);
          
          console.log("[DEBUG] Values set on window appear");
        }, this);

        // Center and open window
        this._editWindow.center();
        this._editWindow.open();
      },

      _saveStudent: function (studentId, studentData) {
        // Update with all existing fields
        const updateData = {
          ...this._currentStudent,
          ...studentData
        };

        fetch(`http://localhost:3000/api/students/${studentId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(updateData)
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
          }
          return response.json();
        })
        .then(updatedStudent => {
          // Reload students to refresh the table
          this.loadStudents();
        })
        .catch(error => {
          console.error("Failed to update student:", error);
          alert("Failed to update student: " + error.message);
        });
      },

      _showDeleteDialog: function (student) {
        // Clear previous content
        this._deleteWindow.removeAll();

        // Create content container with proper padding
        const contentContainer = new qx.ui.container.Composite();
        contentContainer.setLayout(new qx.ui.layout.VBox(15));
        contentContainer.setPadding(10);

        // Add description label with proper width to allow wrapping
        const descriptionLabel = new qooxdo_proj.components.ui.Label(
          "Are you sure you want to delete this student? This action cannot be undone."
        );
        descriptionLabel.setWidth(440);
        // Allow text wrapping by modifying the label element after it appears
        descriptionLabel.addListenerOnce("appear", () => {
          const labelElement = descriptionLabel._getLabelElement();
          if (labelElement) {
            labelElement.style.whiteSpace = "normal";
            labelElement.style.wordWrap = "break-word";
            labelElement.style.maxWidth = "440px";
          }
        }, this);
        contentContainer.add(descriptionLabel);

        // Show student info
        const infoLabel = new qooxdo_proj.components.ui.Label(
          `Student: ${student.firstName} ${student.lastName} (${student.studentId})`
        );
        infoLabel.setWidth(440);
        infoLabel.setFont("bold");
        // Allow text wrapping for student info as well
        infoLabel.addListenerOnce("appear", () => {
          const labelElement = infoLabel._getLabelElement();
          if (labelElement) {
            labelElement.style.whiteSpace = "normal";
            labelElement.style.wordWrap = "break-word";
            labelElement.style.maxWidth = "440px";
          }
        }, this);
        contentContainer.add(infoLabel);

        // Add content container to window
        this._deleteWindow.add(contentContainer, { flex: 1 });

        // Create button container
        const buttonContainer = new qx.ui.container.Composite();
        buttonContainer.setLayout(new qx.ui.layout.HBox(10, "right")); // Right-align buttons
        buttonContainer.setPadding(10);

        // Add buttons
        const cancelButton = new qooxdo_proj.components.ui.Button("Cancel", "outline");
        cancelButton.addListener("execute", () => {
          this._deleteWindow.close();
        }, this);

        const deleteButton = new qooxdo_proj.components.ui.Button("Delete", "");
        deleteButton.addListener("execute", () => {
          this._deleteWindow.close();
          this._deleteStudent(student.id);
        }, this);

        buttonContainer.add(cancelButton);
        buttonContainer.add(deleteButton);

        this._deleteWindow.add(buttonContainer);

        // Center and open window
        this._deleteWindow.center();
        this._deleteWindow.open();
      },

      _deleteStudent: function (studentId) {
        fetch(`http://localhost:3000/api/students/${studentId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          }
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
          }
          return response.json();
        })
        .then(() => {
          // Reload students to refresh the table
          this.loadStudents();
        })
        .catch(error => {
          console.error("Failed to delete student:", error);
          alert("Failed to delete student: " + error.message);
        });
      },

      // Public method to add a student to the table
      addStudent: function (studentData) {
        this._studentRowNumber++;
        const rowData = [
          this._studentRowNumber,
          studentData.studentId || "",
          { text: studentData.firstName || "", classes: "font-medium" },
          { text: studentData.lastName || "", classes: "font-medium" },
          studentData.program || "",
          this._normalizeYearLevel(studentData.yearLevel) || ""
        ];

        // Store full student data with the row
        this._studentsData.push(studentData);
        this._table.addRow(rowData, null, studentData);
      },

      // Clear all students
      clear: function () {
        this._table.clearRows();
        this._studentRowNumber = 0;
        this._studentsData = [];
      },

      // Load students from API
      loadStudents: function () {
        fetch("http://localhost:3000/api/students", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
          }
          return response.json();
        })
        .then(students => {
          // Clear existing rows
          this.clear();
          
          // Add all students to table (store full student object with id)
          students.forEach((student) => {
            this.addStudent({
              id: student.id, // Store id for update/delete operations
              studentId: student.studentId,
              firstName: student.firstName,
              lastName: student.lastName,
              program: student.program,
              yearLevel: student.yearLevel,
              // Store all other fields for complete update
              dateOfBirth: student.dateOfBirth,
              gender: student.gender,
              address: student.address,
              email: student.email,
              personalPhone: student.personalPhone,
              emergencyContact: student.emergencyContact,
              emergencyContactPhone: student.emergencyContactPhone,
              relationship: student.relationship,
              gradeSchool: student.gradeSchool,
              highSchool: student.highSchool,
              college: student.college
            });
          });
        })
        .catch(error => {
          console.error("Failed to load students from API:", error);
        });
      },

      // Get all student data for export
      getStudentsData: function () {
        return this._studentsData || [];
      }
    }
  });
