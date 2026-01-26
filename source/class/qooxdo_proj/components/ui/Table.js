qx.Class.define("qooxdo_proj.components.ui.Table", {
  extend: qx.ui.core.Widget,

  properties: {
    caption: {
      check: "String",
      init: "",
      apply: "_applyCaption",
      event: "changeCaption"
    }
  },

  construct(caption = "") {
    this.base(arguments);

    // Set a layout so children get measured and laid out
    this._setLayout(new qx.ui.layout.Canvas());

    // Store initial values
    this._initialCaption = caption;
    this._headers = [];
    this._rows = [];
    this._footerRows = [];
    this._columnWidths = [];

    // Generate unique ID for the table
    this._tableId = `table-${qx.core.Id.getInstance().toHashCode(this)}`;

    // Create HTML with Basecoat table class
    this._html = new qx.ui.embed.Html(`
      <div class="overflow-x-auto" style="width: 100%; height: 100%;">
        <table class="table" id="${this._tableId}" style="border: 1px solid rgba(0, 0, 0, 0.15); border-collapse: collapse;">
          <caption></caption>
          <thead></thead>
          <tbody></tbody>
          <tfoot></tfoot>
        </table>
      </div>
    `);

    // Add child with layout properties
    this._add(this._html, { edge: 0 });

    // Hook DOM updates after the element appears
    this._html.addListenerOnce("appear", () => {
      // Initialize table elements
      this._tableElement = this._html.getContentElement().getDomElement().querySelector(`#${this._tableId}`);
      this._captionElement = this._tableElement ? this._tableElement.querySelector("caption") : null;
      this._theadElement = this._tableElement ? this._tableElement.querySelector("thead") : null;
      this._tbodyElement = this._tableElement ? this._tableElement.querySelector("tbody") : null;
      this._tfootElement = this._tableElement ? this._tableElement.querySelector("tfoot") : null;

      // Ensure table has visible border and fixed layout for column resizing
      if (this._tableElement) {
        this._tableElement.style.border = "1px solid rgba(0, 0, 0, 0.15)";
        this._tableElement.style.borderCollapse = "collapse";
        this._tableElement.style.tableLayout = "fixed";
        this._tableElement.style.width = "100%";
      }

      // Apply initial caption
      if (this._initialCaption) {
        this.setCaption(this._initialCaption);
      }

      // Render initial data if any
      this._renderTable();
      
      // Setup column resizing
      this._setupColumnResizing();
    });
  },

  members: {
    _html: null,
    _tableElement: null,
    _captionElement: null,
    _theadElement: null,
    _tbodyElement: null,
    _tfootElement: null,
    _tableId: null,
    _initialCaption: null,
    _headers: null,
    _rows: null,
    _footerRows: null,
    _columnWidths: null,
    _isResizing: false,
    _resizeColumnIndex: null,
    _resizeStartX: null,
    _resizeStartWidth: null,

    /**
     * Escape HTML to prevent XSS attacks
     * @param {String} text - Text to escape
     * @return {String} Escaped text
     */
    _escapeHtml(text) {
      if (text === null || text === undefined) return "";
      const div = document.createElement("div");
      div.textContent = String(text);
      return div.innerHTML;
    },

    /**
     * Apply caption changes to the DOM
     * @param {String} caption - The new caption
     */
    _applyCaption(caption) {
      if (this._captionElement) {
        this._captionElement.textContent = caption || "";
        // Show/hide caption element
        this._captionElement.style.display = caption ? "" : "none";
      }
    },

    /**
     * Set table headers
     * @param {Array<String>} headers - Array of header text
     */
    setHeaders(headers) {
      this._headers = headers || [];
      this._renderTable();
    },

    /**
     * Add a row to the table body
     * @param {Array} rowData - Array of cell data (strings or objects with {text, classes, align})
     * @param {Number} index - Optional index to insert at (defaults to end)
     */
    addRow(rowData, index = null) {
      if (!rowData || !Array.isArray(rowData)) {
        return;
      }

      const row = {
        cells: rowData.map(cell => {
          if (typeof cell === "string" || typeof cell === "number") {
            return { text: String(cell), classes: "", align: "" };
          } else if (cell && typeof cell === "object") {
            return {
              text: String(cell.text || cell.value || ""),
              classes: cell.classes || cell.className || "",
              align: cell.align || cell.textAlign || ""
            };
          }
          return { text: "", classes: "", align: "" };
        })
      };

      if (index === null || index === undefined) {
        this._rows.push(row);
      } else {
        this._rows.splice(index, 0, row);
      }

      this._renderTable();
    },

    /**
     * Remove a row by index
     * @param {Number} index - Index of row to remove
     */
    removeRow(index) {
      if (index >= 0 && index < this._rows.length) {
        this._rows.splice(index, 1);
        this._renderTable();
      }
    },

    /**
     * Clear all rows from the table body
     */
    clearRows() {
      this._rows = [];
      this._renderTable();
    },

    /**
     * Add a footer row
     * @param {Array} rowData - Array of cell data (strings or objects with {text, classes, align, colspan})
     */
    addFooterRow(rowData) {
      if (!rowData || !Array.isArray(rowData)) {
        return;
      }

      const row = {
        cells: rowData.map(cell => {
          if (typeof cell === "string" || typeof cell === "number") {
            return { text: String(cell), classes: "", align: "", colspan: 1 };
          } else if (cell && typeof cell === "object") {
            return {
              text: String(cell.text || cell.value || ""),
              classes: cell.classes || cell.className || "",
              align: cell.align || cell.textAlign || "",
              colspan: cell.colspan || 1
            };
          }
          return { text: "", classes: "", align: "", colspan: 1 };
        })
      };

      this._footerRows.push(row);
      this._renderTable();
    },

    /**
     * Clear all footer rows
     */
    clearFooterRows() {
      this._footerRows = [];
      this._renderTable();
    },

    /**
     * Get all rows
     * @return {Array} Array of row data
     */
    getRows() {
      return this._rows.map(row => ({
        cells: row.cells.map(cell => ({
          text: cell.text,
          classes: cell.classes,
          align: cell.align
        }))
      }));
    },

    /**
     * Get row count
     * @return {Number} Number of rows
     */
    getRowCount() {
      return this._rows.length;
    },

    /**
     * Render the entire table
     */
    _renderTable() {
      if (!this._tableElement) {
        return;
      }

      // Render header
      if (this._theadElement && this._headers.length > 0) {
        this._theadElement.innerHTML = "";
        const headerRow = document.createElement("tr");
        // Ensure header row has visible border
        headerRow.style.borderBottom = "1px solid rgba(0, 0, 0, 0.1)";
        this._headers.forEach((headerText, index) => {
          const th = document.createElement("th");
          
          // Apply column width if set
          if (this._columnWidths[index]) {
            th.style.width = this._columnWidths[index] + "px";
            th.style.minWidth = this._columnWidths[index] + "px";
            th.style.maxWidth = this._columnWidths[index] + "px";
          }
          
          // Add cell borders
          th.style.borderRight = "1px solid rgba(0, 0, 0, 0.1)";
          th.style.borderBottom = "1px solid rgba(0, 0, 0, 0.1)";
          th.style.position = "relative";
          
          // Set content directly
          th.textContent = this._escapeHtml(headerText);
          th.style.paddingRight = index < this._headers.length - 1 ? "8px" : "";
          th.style.overflow = "hidden";
          th.style.textOverflow = "ellipsis";
          th.style.whiteSpace = "nowrap";
          
          // Create resize handle on the border (only if not last column)
          if (index < this._headers.length - 1) {
            const resizeHandle = document.createElement("div");
            resizeHandle.className = "table-resize-handle";
            resizeHandle.style.position = "absolute";
            resizeHandle.style.right = "-4px"; // Center on the border (half on each side)
            resizeHandle.style.top = "0";
            resizeHandle.style.width = "8px"; // Wider for easier grabbing
            resizeHandle.style.height = "100%";
            resizeHandle.style.cursor = "col-resize";
            resizeHandle.style.zIndex = "10";
            resizeHandle.style.userSelect = "none";
            resizeHandle.setAttribute("data-column-index", index);
            
            // Add hover effect - highlight the border
            resizeHandle.addEventListener("mouseenter", () => {
              if (!this._isResizing) {
                th.style.borderRight = "2px solid rgba(0, 0, 0, 0.3)";
                resizeHandle.style.backgroundColor = "rgba(0, 0, 0, 0.05)";
              }
            });
            resizeHandle.addEventListener("mouseleave", () => {
              if (!this._isResizing) {
                th.style.borderRight = "1px solid rgba(0, 0, 0, 0.1)";
                resizeHandle.style.backgroundColor = "transparent";
              }
            });
            
            th.appendChild(resizeHandle);
          }
          
          // Remove right border from last cell
          if (index === this._headers.length - 1) {
            th.style.borderRight = "none";
          }
          
          headerRow.appendChild(th);
        });
        this._theadElement.appendChild(headerRow);
      } else if (this._theadElement) {
        this._theadElement.innerHTML = "";
      }

      // Render body rows
      if (this._tbodyElement) {
        this._tbodyElement.innerHTML = "";
        this._rows.forEach(row => {
          const tr = document.createElement("tr");
          row.cells.forEach((cell, index) => {
            const td = document.createElement("td");
            td.textContent = this._escapeHtml(cell.text);
            
            // Apply column width if set
            if (this._columnWidths[index]) {
              td.style.width = this._columnWidths[index] + "px";
              td.style.minWidth = this._columnWidths[index] + "px";
              td.style.maxWidth = this._columnWidths[index] + "px";
            }
            
            // Add cell borders
            td.style.borderRight = "1px solid rgba(0, 0, 0, 0.1)";
            td.style.borderBottom = "1px solid rgba(0, 0, 0, 0.1)";
            // Remove right border from last cell
            if (index === row.cells.length - 1) {
              td.style.borderRight = "none";
            }
            
            // Apply classes
            if (cell.classes) {
              td.className = cell.classes;
            }
            
            // Apply alignment
            if (cell.align) {
              td.style.textAlign = cell.align;
            }
            
            tr.appendChild(td);
          });
          this._tbodyElement.appendChild(tr);
        });
      }

      // Render footer rows
      if (this._tfootElement) {
        this._tfootElement.innerHTML = "";
        this._footerRows.forEach(row => {
          const tr = document.createElement("tr");
          row.cells.forEach((cell, index) => {
            const td = document.createElement("td");
            td.textContent = this._escapeHtml(cell.text);
            
            // Apply column width if set (only if no colspan)
            if (!cell.colspan || cell.colspan === 1) {
              if (this._columnWidths[index]) {
                td.style.width = this._columnWidths[index] + "px";
                td.style.minWidth = this._columnWidths[index] + "px";
                td.style.maxWidth = this._columnWidths[index] + "px";
              }
            }
            
            // Add cell borders
            td.style.borderRight = "1px solid rgba(0, 0, 0, 0.1)";
            td.style.borderBottom = "1px solid rgba(0, 0, 0, 0.1)";
            // Remove right border from last cell (unless it has colspan)
            if (index === row.cells.length - 1 && (!cell.colspan || cell.colspan === 1)) {
              td.style.borderRight = "none";
            }
            
            // Apply colspan
            if (cell.colspan && cell.colspan > 1) {
              td.setAttribute("colspan", cell.colspan);
            }
            
            // Apply classes
            if (cell.classes) {
              td.className = cell.classes;
            }
            
            // Apply alignment
            if (cell.align) {
              td.style.textAlign = cell.align;
            }
            
            tr.appendChild(td);
          });
          this._tfootElement.appendChild(tr);
        });
        
        // Show/hide tfoot
        this._tfootElement.style.display = this._footerRows.length > 0 ? "" : "none";
      }
    },

    /**
     * Setup column resizing functionality
     */
    _setupColumnResizing() {
      if (!this._theadElement) {
        return;
      }

      // Add event delegation for resize handles
      this._theadElement.addEventListener("mousedown", (e) => {
        const handle = e.target.closest(".table-resize-handle");
        if (!handle) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();

        const columnIndex = parseInt(handle.getAttribute("data-column-index"));
        if (isNaN(columnIndex)) {
          return;
        }

        // Get the header cell
        const th = handle.closest("th");
        if (!th) {
          return;
        }

        // Initialize resizing
        this._isResizing = true;
        this._resizeColumnIndex = columnIndex;
        this._resizeStartX = e.clientX;
        this._resizeStartWidth = th.offsetWidth;

        // Add visual feedback - highlight border during resize
        th.style.borderRight = "2px solid rgba(0, 0, 0, 0.4)";
        handle.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";

        // Add global mouse move and up handlers
        const mouseMoveHandler = (e) => {
          if (!this._isResizing) {
            return;
          }

          const diff = e.clientX - this._resizeStartX;
          const newWidth = Math.max(50, this._resizeStartWidth + diff); // Minimum width of 50px

          // Update column width
          this._columnWidths[this._resizeColumnIndex] = newWidth;

          // Apply width to all cells in this column
          this._applyColumnWidth(this._resizeColumnIndex, newWidth);
        };

        const mouseUpHandler = () => {
          this._isResizing = false;
          this._resizeColumnIndex = null;
          this._resizeStartX = null;
          this._resizeStartWidth = null;

          // Remove visual feedback - restore normal border
          if (th) {
            th.style.borderRight = "1px solid rgba(0, 0, 0, 0.1)";
          }
          if (handle) {
            handle.style.backgroundColor = "transparent";
          }
          document.body.style.cursor = "";
          document.body.style.userSelect = "";

          // Remove event listeners
          document.removeEventListener("mousemove", mouseMoveHandler);
          document.removeEventListener("mouseup", mouseUpHandler);
        };

        document.addEventListener("mousemove", mouseMoveHandler);
        document.addEventListener("mouseup", mouseUpHandler);
      });
    },

    /**
     * Apply width to all cells in a specific column
     * @param {Number} columnIndex - Index of the column
     * @param {Number} width - Width in pixels
     */
    _applyColumnWidth(columnIndex, width) {
      if (!this._tableElement) {
        return;
      }

      // Update header cell
      const headerRow = this._theadElement ? this._theadElement.querySelector("tr") : null;
      if (headerRow) {
        const th = headerRow.children[columnIndex];
        if (th) {
          th.style.width = width + "px";
          th.style.minWidth = width + "px";
          th.style.maxWidth = width + "px";
        }
      }

      // Update all body cells in this column
      if (this._tbodyElement) {
        const rows = this._tbodyElement.querySelectorAll("tr");
        rows.forEach(tr => {
          const td = tr.children[columnIndex];
          if (td) {
            td.style.width = width + "px";
            td.style.minWidth = width + "px";
            td.style.maxWidth = width + "px";
          }
        });
      }

      // Update all footer cells in this column
      if (this._tfootElement) {
        const rows = this._tfootElement.querySelectorAll("tr");
        rows.forEach(tr => {
          const td = tr.children[columnIndex];
          if (td && !td.hasAttribute("colspan")) {
            td.style.width = width + "px";
            td.style.minWidth = width + "px";
            td.style.maxWidth = width + "px";
          }
        });
      }
    }
  }
});
