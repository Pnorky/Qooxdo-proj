// @ts-nocheck
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
      _pendingDeleteStudentId: null,
      _feedbackToast: null,
      _feedbackDialog: null,

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

        // Enable pagination with basecoat styling
        this._table.setPagination(true);
        this._table.setPageSize(10); // Show 10 rows per page 

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

        // Listen to page change events
        this._table.addListener("pageChange", (e) => {
          const pageData = e.getData();
          console.log("Page changed to:", pageData.currentPage, "of", pageData.totalPages);
        }, this);

        this.add(this._table, { flex: 1 });
      },

      _createWindows: function () {
        // Create edit dialog (custom UI component)
        this._editWindow = new qooxdo_proj.components.ui.Dialog(
          "Edit Student",
          "Update student information below."
        );
        this._editWindow.setSize("lg");
        this._editWindow.setDialogMaxWidth("700px");
        this._editWindow.setDialogMaxHeight("80vh");
        this._editWindow.setSaveLabel("Save Student");
        this._editWindow.setCancelLabel("Cancel");
        this._editWindow.setSaveIntent("primary");
        this._editWindow.addListener("save", () => {
          if (!this._currentStudent || this._currentStudent.id == null) {
            return;
          }
          const formData = this._collectEditFormData();
          this._editWindow.setVisibility("excluded");
          this._saveStudent(this._currentStudent.id, formData);
        }, this);
        this._editWindow.addListener("cancel", () => {
          this._editWindow.setVisibility("excluded");
        }, this);

        // Create delete confirmation dialog (custom UI component)
        this._deleteWindow = new qooxdo_proj.components.ui.Dialog(
          "Delete Student",
          "Please review the details before continuing."
        );
        this._deleteWindow.setSize("md");
        this._deleteWindow.setDialogMaxWidth("640px");
        this._deleteWindow.setDialogMaxHeight("72vh");
        this._deleteWindow.setCancelLabel("Keep Student");
        this._deleteWindow.setSaveLabel("Delete Student");
        this._deleteWindow.setSaveIntent("destructive");
        this._deleteWindow.addListener("save", () => {
          if (this._pendingDeleteStudentId != null) {
            this._deleteStudent(this._pendingDeleteStudentId);
            this._pendingDeleteStudentId = null;
          }
          this._deleteWindow.setVisibility("excluded");
        }, this);
        this._deleteWindow.addListener("cancel", () => {
          this._pendingDeleteStudentId = null;
          this._deleteWindow.setVisibility("excluded");
        }, this);
        
        // Add windows to root
        const root = qx.core.Init.getApplication().getRoot();
        if (root) {
          root.add(this._editWindow, { left: 0, top: 0 });
          this._editWindow.setVisibility("excluded");
          root.add(this._deleteWindow, { left: 0, top: 0 });
          this._deleteWindow.setVisibility("excluded");
        }
      },

      _ensureFeedbackUI: function () {
        if (this._feedbackToast && this._feedbackDialog) return;
        const root = qx.core.Init.getApplication().getRoot();
        if (!root) return;

        if (!this._feedbackToast) {
          this._feedbackToast = new qooxdo_proj.components.ui.Toast();
          root.add(this._feedbackToast, { edge: 0 });
        }

        if (!this._feedbackDialog) {
          this._feedbackDialog = new qooxdo_proj.components.ui.Dialog("Action failed", "");
          this._feedbackDialog.setCancelLabel("Close");
          this._feedbackDialog.setSaveLabel("OK");
          this._feedbackDialog.setVisibility("excluded");
          this._feedbackDialog.addListener("save", () => {
            this._feedbackDialog.setVisibility("excluded");
          }, this);
          this._feedbackDialog.addListener("cancel", () => {
            this._feedbackDialog.setVisibility("excluded");
          }, this);
          root.add(this._feedbackDialog, { left: 0, top: 0 });
        }
      },

      _showErrorFeedback: function (title, message) {
        this._ensureFeedbackUI();
        const safeTitle = title || "Action failed";
        const safeMessage = message || "Unexpected error";

        if (this._feedbackToast) {
          this._feedbackToast.show({
            category: "error",
            title: safeTitle,
            description: safeMessage,
            cancel: { label: "Dismiss" }
          });
        }

        if (this._feedbackDialog) {
          this._feedbackDialog.setTitle(safeTitle);
          this._feedbackDialog.setDescription("Please review the error details below.");
          this._feedbackDialog.setRichSectionContent(false);
          this._feedbackDialog.setSectionContent(safeMessage);
          this._feedbackDialog.setVisibility("visible");
          this._feedbackDialog.show();
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
        this._currentStudent = student;
        this._editWindow.setTitle("Edit Student");
        this._editWindow.setDescription("Update student information below.");
        this._editWindow.setCancelLabel("Cancel");
        this._editWindow.setSaveLabel("Save Student");
        this._editWindow.setSaveIntent("primary");
        this._editWindow.setRichSectionContent(true);
        this._editWindow.setSectionContent(this._buildEditFormHtml(student));
        this._editWindow.setVisibility("visible");
        this._editWindow.show();
        this._wireEditDialogActions(student);
      },

      _toDateInputValue: function (value) {
        if (!value) return "";
        try {
          const d = new Date(value);
          if (isNaN(d.getTime())) return "";
          return d.toISOString().slice(0, 10);
        } catch (_e) {
          return "";
        }
      },

      _escapeHtml: function (value) {
        const div = document.createElement("div");
        div.textContent = value == null ? "" : String(value);
        return div.innerHTML;
      },

      _buildEditFormHtml: function (student) {
        const esc = this._escapeHtml.bind(this);
        const dateValue = this._toDateInputValue(student.dateOfBirth);
        const yearValue = this._formatYearLevelForComboBox(student.yearLevel) || "";
        const programOptions = [
          "Bachelor of Science in Computer Science",
          "Bachelor of Science in Information Technology",
          "Bachelor of Science in Information Systems",
          "Bachelor of Science in Business Administration",
          "Bachelor of Science in Accounting",
          "Bachelor of Science in Marketing",
          "Bachelor of Science in Management"
        ];

        return `
          <div style="display:grid; gap:14px; max-height:60vh; overflow:auto; padding-right:4px;">
            <div style="font-weight:700; font-size:15px;">Personal Information</div>
            <div style="display:grid; grid-template-columns:160px 1fr; gap:10px; align-items:center;">
              <label for="edit-student-id">Student ID:</label>
              <input id="edit-student-id" class="input" type="text" value="${esc(student.studentId || "")}">
              <label for="edit-first-name">First Name:</label>
              <input id="edit-first-name" class="input" type="text" value="${esc(student.firstName || "")}">
              <label for="edit-last-name">Last Name:</label>
              <input id="edit-last-name" class="input" type="text" value="${esc(student.lastName || "")}">
              <label for="edit-date-of-birth">Date of Birth:</label>
              <input id="edit-date-of-birth" class="input" type="date" value="${esc(dateValue)}">
              <label for="edit-gender">Gender:</label>
              <select id="edit-gender" class="input">
                <option value="">Select gender</option>
                <option value="Male" ${student.gender === "Male" ? "selected" : ""}>Male</option>
                <option value="Female" ${student.gender === "Female" ? "selected" : ""}>Female</option>
              </select>
              <label for="edit-address">Address:</label>
              <textarea id="edit-address" class="textarea" rows="3">${esc(student.address || "")}</textarea>
            </div>

            <div style="font-weight:700; font-size:15px; margin-top:4px;">Contact Information</div>
            <div style="display:grid; grid-template-columns:160px 1fr; gap:10px; align-items:center;">
              <label for="edit-email">Email:</label>
              <input id="edit-email" class="input" type="email" value="${esc(student.email || "")}">
              <label for="edit-personal-phone">Personal Phone:</label>
              <input id="edit-personal-phone" class="input" type="text" value="${esc(student.personalPhone || "")}">
              <label for="edit-emergency-contact">Emergency Contact:</label>
              <input id="edit-emergency-contact" class="input" type="text" value="${esc(student.emergencyContact || "")}">
              <label for="edit-emergency-contact-phone">Emergency Contact Phone:</label>
              <input id="edit-emergency-contact-phone" class="input" type="text" value="${esc(student.emergencyContactPhone || "")}">
              <label for="edit-relationship">Relationship:</label>
              <input id="edit-relationship" class="input" type="text" value="${esc(student.relationship || "")}">
            </div>

            <div style="font-weight:700; font-size:15px; margin-top:4px;">Academic Information</div>
            <div style="display:grid; grid-template-columns:160px 1fr; gap:10px; align-items:center;">
              <label for="edit-program">Program:</label>
              <input id="edit-program" class="input" type="text" list="edit-program-list" value="${esc(student.program || "")}">
              <datalist id="edit-program-list">
                ${programOptions.map(opt => `<option value="${esc(opt)}"></option>`).join("")}
              </datalist>
              <label for="edit-year-level">Year Level:</label>
              <select id="edit-year-level" class="input">
                <option value="">Select year level</option>
                <option value="1st Year" ${yearValue === "1st Year" ? "selected" : ""}>1st Year</option>
                <option value="2nd Year" ${yearValue === "2nd Year" ? "selected" : ""}>2nd Year</option>
                <option value="3rd Year" ${yearValue === "3rd Year" ? "selected" : ""}>3rd Year</option>
                <option value="4th Year" ${yearValue === "4th Year" ? "selected" : ""}>4th Year</option>
              </select>
              <label for="edit-grade-school">Grade School:</label>
              <input id="edit-grade-school" class="input" type="text" value="${esc(student.gradeSchool || "")}">
              <label for="edit-high-school">High School:</label>
              <input id="edit-high-school" class="input" type="text" value="${esc(student.highSchool || "")}">
              <label for="edit-college">College:</label>
              <input id="edit-college" class="input" type="text" value="${esc(student.college || "")}">
            </div>

          </div>
        `;
      },

      _wireEditDialogActions: function (student, retriesLeft) {
        const retries = retriesLeft == null ? 8 : retriesLeft;
        const dialogEl = this._editWindow.getDialogElement ? this._editWindow.getDialogElement() : null;
        const footer = dialogEl ? dialogEl.querySelector("footer") : null;
        if (!footer) {
          if (retries > 0) {
            qx.event.Timer.once(() => this._wireEditDialogActions(student, retries - 1), this, 30);
          }
          return;
        }

        let deleteBtn = footer.querySelector(".dialog-delete-btn");
        if (!deleteBtn) {
          deleteBtn = document.createElement("button");
          deleteBtn.type = "button";
          deleteBtn.className = "btn btn-sm dialog-delete-btn";
          deleteBtn.textContent = "Delete";
          deleteBtn.style.background = "var(--secondary)";
          deleteBtn.style.color = "var(--secondary-foreground)";
          deleteBtn.style.border = "1px solid var(--border)";
          footer.insertBefore(deleteBtn, footer.firstChild);
        }

        // Rebind per open so delete always targets the currently edited student.
        deleteBtn.onclick = () => {
          this._editWindow.close();
          this._editWindow.setVisibility("excluded");
          this._showDeleteDialog(student);
        };
      },

      _collectEditFormData: function () {
        const section = this._editWindow.getSectionElement();
        if (!section) return {};
        const get = (id) => {
          const el = section.querySelector(`#${id}`);
          return el ? String(el.value || "").trim() : "";
        };
        const dateValue = get("edit-date-of-birth");
        return {
          studentId: get("edit-student-id"),
          firstName: get("edit-first-name"),
          lastName: get("edit-last-name"),
          dateOfBirth: dateValue || null,
          gender: get("edit-gender"),
          address: get("edit-address"),
          email: get("edit-email"),
          personalPhone: get("edit-personal-phone"),
          emergencyContact: get("edit-emergency-contact"),
          emergencyContactPhone: get("edit-emergency-contact-phone"),
          relationship: get("edit-relationship"),
          program: get("edit-program"),
          yearLevel: this._normalizeYearLevel(get("edit-year-level")) || "",
          gradeSchool: get("edit-grade-school"),
          highSchool: get("edit-high-school"),
          college: get("edit-college")
        };
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
        .then(result => {
          // Reload students to refresh the table
          this.loadStudents();

            // Show success feedback for update action
            this._ensureFeedbackUI();
            if (this._feedbackToast) {
              this._feedbackToast.show({
                category: "success",
                title: "Student updated",
                description: "Student information was updated successfully.",
                cancel: { label: "Dismiss" }
              });
            }
        })
        .catch(error => {
          console.error("Failed to update student:", error);
            this._showErrorFeedback("Failed to update student", error.message);
        });
      },

      _showDeleteDialog: function (student) {
        this._pendingDeleteStudentId = student && student.id ? student.id : null;
        const esc = (value) => {
          const div = document.createElement("div");
          div.textContent = value == null ? "" : String(value);
          return div.innerHTML;
        };

        const studentName = `${student.firstName || ""} ${student.lastName || ""}`.trim() || "N/A";
        const studentId = student.studentId || "N/A";
        const program = student.program || "N/A";
        const yearLevel = this._normalizeYearLevel(student.yearLevel) || "N/A";
        const email = student.email || "N/A";
        const personalPhone = student.personalPhone || "N/A";

        this._deleteWindow.setRichSectionContent(true);
        this._deleteWindow.setSectionContent(`
          <div style="display:grid; gap:12px; width:100%;">
            <div style="display:flex; gap:10px; align-items:flex-start; padding:12px 14px; border:1px solid var(--destructive); border-radius:10px; background:color-mix(in srgb, var(--destructive) 7%, transparent);">
              <span style="font-size:16px; line-height:1.2; font-weight:700;">!</span>
              <div>
                <div style="font-weight:700; font-size:16px; margin-bottom:4px;">Delete this student record?</div>
                <div style="color:var(--foreground); font-size:14px; line-height:1.45;">
                  This permanently removes the student from the system and cannot be undone.
                </div>
              </div>
            </div>

            <div style="display:grid; gap:10px; padding:12px 14px; border:1px solid var(--border); border-radius:10px; background:var(--card);">
              <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
                <div style="font-size:20px; font-weight:700; line-height:1.2;">${esc(studentName)}</div>
                <div style="font-size:12px; color:var(--muted-foreground); border:1px solid var(--border); border-radius:999px; padding:2px 8px;">ID ${esc(studentId)}</div>
              </div>
              <div style="font-size:14px; color:var(--muted-foreground);">Program: ${esc(program)}</div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <div>
                  <div style="font-size:12px; color:var(--muted-foreground);">Year Level</div>
                  <div style="font-size:14px; font-weight:600;">${esc(yearLevel)}</div>
                </div>
                <div>
                  <div style="font-size:12px; color:var(--muted-foreground);">Phone</div>
                  <div style="font-size:14px; font-weight:600;">${esc(personalPhone)}</div>
                </div>
              </div>

              <div>
                <div style="font-size:12px; color:var(--muted-foreground);">Email</div>
                <div style="font-size:14px; font-weight:600; word-break:break-word;">${esc(email)}</div>
              </div>
            </div>

            <div style="font-size:12px; color:var(--muted-foreground);">
              Select <strong>Keep Student</strong> to cancel, or <strong>Delete Student</strong> to confirm.
            </div>
          </div>
        `);
        this._deleteWindow.setVisibility("visible");
        this._deleteWindow.show();
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
        .then(result => {
          this.loadStudents();
          this._ensureFeedbackUI();
          if (this._feedbackToast) {
            this._feedbackToast.show({
              category: "success",
              title: "Student deleted",
              description: "The student record was permanently removed.",
              cancel: { label: "Dismiss" }
            });
          }
        })
        .catch(error => {
          console.error("Failed to delete student:", error);
          this._showErrorFeedback("Failed to delete student", error.message);
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

        // Use addRow - pagination will automatically handle display
        this._table.addRow(rowData);

        // Update total rows for pagination
        this._table.setTotalRows(this._studentsData.length);
      },

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

            // Reset student row number
            this._studentRowNumber = 0;
            this._studentsData = [];

            // Build rows array for efficient bulk loading with pagination
            const rows = students.map((student, index) => {
              // Store full student data
              this._studentsData.push({
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

              return [
                index + 1,
                student.studentId || "",
                { text: student.firstName || "", classes: "font-medium" },
                { text: student.lastName || "", classes: "font-medium" },
                student.program || "",
                this._normalizeYearLevel(student.yearLevel) || ""
              ];
            });

            this._studentRowNumber = students.length;

            // Use setRows for efficient bulk loading with pagination
            this._table.setRows(rows);

            // Update total rows for pagination
            this._table.setTotalRows(rows.length);
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
