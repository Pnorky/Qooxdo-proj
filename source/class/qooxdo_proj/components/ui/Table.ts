qx.Class.define("qooxdo_proj.components.ui.Table", {
  extend: qx.ui.core.Widget,

  properties: {
    caption: {
      check: "String",
      init: "",
      apply: "_applyCaption",
      event: "changeCaption"
    },

    /** Number of rows per page for pagination */
    pageSize: {
      check: "Number",
      init: 10,
      apply: "_applyPageSize",
      event: "changePageSize"
    },

    /** Current page number (1-based) */
    currentPage: {
      check: "Number",
      init: 1,
      apply: "_applyCurrentPage",
      event: "changeCurrentPage"
    },

    /** Total number of rows (for pagination calculation) */
    totalRows: {
      check: "Number",
      init: 0,
      apply: "_applyTotalRows",
      event: "changeTotalRows"
    },

    /** Whether to show pagination controls */
    pagination: {
      check: "Boolean",
      init: false,
      apply: "_applyPagination",
      event: "changePagination"
    }
  },

  events: {
    /** Fired when a table row is clicked. Data: {rowIndex: number, rowData: object} */
    "rowClick": "qx.event.type.Data",

    /** Fired when page changes. Data: {currentPage: number, pageSize: number, totalPages: number} */
    "pageChange": "qx.event.type.Data"
  },

  construct(caption = "") {
    (this as any).base(arguments);

    // Set a layout so children get measured and laid out
    this._setLayout(new qx.ui.layout.Canvas());

    // Store initial values
    this._initialCaption = caption;
    this._headers = [];
    this._allRows = []; // Store all rows for pagination
    this._rows = []; // Current page rows
    this._footerRows = [];
    this._columnWidths = [];

    // Pagination state
    this._currentPage = 1;
    this._pageSize = 10;
    this._totalRows = 0;
    this._paginationEnabled = false;

    // Generate unique ID for the table
    this._tableId = `table-${this.toHashCode()}`;

    // Create HTML with Basecoat table class and pagination
    this._html = new qx.ui.embed.Html(`
      <div class="table-container" style="width: 100%; height: 100%; display: flex; flex-direction: column;">
        <div class="overflow-x-auto" style="flex: 1; overflow: auto;">
          <table class="table" id="${this._tableId}" style="border: 1px solid var(--border); border-collapse: collapse; width: 100%;">
            <caption></caption>
            <thead></thead>
            <tbody></tbody>
            <tfoot></tfoot>
          </table>
        </div>
        <nav role="navigation" aria-label="pagination" class="pagination-container mx-auto flex w-full justify-center" style="display: none; padding: 16px 0; margin-top: 8px; border-top: 1px solid var(--border); overflow: visible; flex-shrink: 0; min-height: 60px;">
          <ul class="pagination-pages-list flex flex-row items-center gap-1" style="display: flex; flex-direction: row; flex-wrap: nowrap; list-style: none; margin: 0; padding: 0; gap: 4px; overflow: visible; align-items: center;">
            <li style="flex-shrink: 0;">
              <a href="#" class="btn-ghost pagination-prev" tabindex="0" style="display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; overflow: visible; width: auto; min-width: max-content; padding: 0 10px; height: 36px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="m15 18-6-6 6-6" /></svg>
                <span>Previous</span>
              </a>
            </li>
            <li class="pagination-pages" style="display: flex; flex-direction: row; flex-wrap: nowrap;"></li>
            <li>
              <div class="pagination-ellipsis size-9 flex items-center justify-center" style="display: none;">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 shrink-0"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
              </div>
            </li>
            <li style="flex-shrink: 0;">
              <a href="#" class="btn-ghost pagination-next" tabindex="0" style="display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; overflow: visible; width: auto; min-width: max-content; padding: 0 10px; height: 36px;">
                <span>Next</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="m9 18 6-6-6-6" /></svg>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    `);

    // Add child with layout properties
    this._add(this._html, { edge: 0 });

    // Hook DOM updates after the element appears
    this._html.addListenerOnce("appear", () => {
      // Get container element
      const container = this._html.getContentElement().getDomElement();

      // Initialize table elements
      this._tableElement = container.querySelector(`#${this._tableId}`);
      this._captionElement = this._tableElement ? this._tableElement.querySelector("caption") : null;
      this._theadElement = this._tableElement ? this._tableElement.querySelector("thead") : null;
      this._tbodyElement = this._tableElement ? this._tableElement.querySelector("tbody") : null;
      this._tfootElement = this._tableElement ? this._tableElement.querySelector("tfoot") : null;

      // Initialize pagination elements
      this._paginationContainer = container.querySelector(".pagination-container");
      this._paginationPages = container.querySelector(".pagination-pages");
      this._paginationPrev = container.querySelector(".pagination-prev");
      this._paginationNext = container.querySelector(".pagination-next");
      this._paginationEllipsis = container.querySelector(".pagination-ellipsis");

      // Apply pagination settings after DOM is ready
      if (this._paginationEnabled && this._paginationContainer) {
        this._paginationContainer.style.display = "flex";
        this._updatePagination();
      }

      // Ensure table has visible border and auto layout for automatic column width adjustment
      if (this._tableElement) {
        this._tableElement.style.border = "1px solid var(--border)";
        this._tableElement.style.borderCollapse = "collapse";
        // Use auto layout to allow columns to adjust based on content
        this._tableElement.style.tableLayout = "auto";
        this._tableElement.style.width = "100%";
      }

      // Apply initial caption
      if (this._initialCaption) {
        this.setCaption(this._initialCaption);
      }

      // Render initial data if any
      this._renderTable();
      
      // Auto-adjust column widths after initial render if no explicit widths are set
      if (this._rows.length > 0 && !this._hasExplicitColumnWidths()) {
        qx.event.Timer.once(() => {
          this._autoAdjustColumnWidths();
        }, this, 100);
      }
      
      // Setup column resizing
      this._setupColumnResizing();
      
      // Setup row click events after table is rendered
      this._setupRowClickEvents();
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
    _allRows: null,
    _rows: null,
    _footerRows: null,
    _columnWidths: null,
    _isResizing: false,
    _resizeColumnIndex: null,
    _resizeStartX: null,
    _resizeStartWidth: null,
    _rowClickHandler: null,

    // Pagination elements
    _paginationContainer: null,
    _paginationPages: null,
    _paginationPrev: null,
    _paginationNext: null,
    _paginationEllipsis: null,
    _paginationClickHandler: null,

    // Pagination state
    _currentPage: null,
    _pageSize: null,
    _totalRows: null,
    _paginationEnabled: null,

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
     * Apply pageSize changes
     * @param {Number} pageSize - New page size
     */
    _applyPageSize(pageSize) {
      this._pageSize = pageSize;
      if (this._paginationEnabled) {
        // Reset to first page when page size changes
        this._currentPage = 1;
        this._updateCurrentPageRows();
        this._updatePagination();
        this._renderTable();
      }
    },

    /**
     * Apply currentPage changes
     * @param {Number} currentPage - New current page
     */
    _applyCurrentPage(currentPage) {
      const totalPages = this.getTotalPages();
      if (currentPage < 1) {
        currentPage = 1;
      } else if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
      }
      this._currentPage = currentPage;
      if (this._paginationEnabled) {
        this._updateCurrentPageRows();
        this._updatePagination();
        this._renderTable();
      }
    },

    /**
     * Apply totalRows changes
     * @param {Number} totalRows - New total rows
     */
    _applyTotalRows(totalRows) {
      this._totalRows = totalRows;
      if (this._paginationEnabled) {
        // Adjust current page if it's beyond the total pages
        const totalPages = this.getTotalPages();
        if (this._currentPage > totalPages) {
          this._currentPage = totalPages > 0 ? totalPages : 1;
        }
        this._updateCurrentPageRows();
        this._updatePagination();
        this._renderTable();
      }
    },

    /**
     * Apply pagination changes
     * @param {Boolean} enabled - Whether pagination is enabled
     */
    _applyPagination(enabled) {
      this._paginationEnabled = enabled;
      if (enabled) {
        // Copy all rows to _allRows if not already done
        if (this._allRows.length === 0 && this._rows.length > 0) {
          this._allRows = [...this._rows];
          this._totalRows = this._allRows.length;
        }
        this._updateCurrentPageRows();
        this._updatePagination();
      } else {
        // When disabling pagination, show all rows
        if (this._allRows.length > 0) {
          this._rows = [...this._allRows];
          this._renderTable();
        }
      }
      if (this._paginationContainer) {
        this._paginationContainer.style.display = enabled ? "flex" : "none";
      }
    },

    /**
     * Get total number of pages
     * @return {Number} Total pages
     */
    getTotalPages() {
      if (this._pageSize <= 0) return 0;
      return Math.ceil(this._totalRows / this._pageSize);
    },

    /**
     * Enable or disable pagination
     * @param {Boolean} enabled - Whether to enable pagination
     */
    setPaginationEnabled(enabled) {
      this.setPagination(enabled);
    },

    /**
     * Go to a specific page
     * @param {Number} page - Page number to go to (1-based)
     */
    goToPage(page) {
      const totalPages = this.getTotalPages();
      if (page < 1) page = 1;
      if (page > totalPages) page = totalPages;

      const oldPage = this._currentPage;
      this._currentPage = page;

      // Update the rows to show for the current page
      if (this._paginationEnabled) {
        this._updateCurrentPageRows();
      }

      this._updatePagination();
      this._renderTable();

      // Fire page change event
      if (oldPage !== page) {
        this.fireDataEvent("pageChange", {
          currentPage: page,
          pageSize: this._pageSize,
          totalPages: totalPages
        });
      }
    },

    /**
     * Go to next page
     */
    nextPage() {
      const totalPages = this.getTotalPages();
      if (this._currentPage < totalPages) {
        this.goToPage(this._currentPage + 1);
      }
    },

    /**
     * Go to previous page
     */
    previousPage() {
      if (this._currentPage > 1) {
        this.goToPage(this._currentPage - 1);
      }
    },

    /**
     * Update pagination UI
     */
    _updatePagination() {
      if (!this._paginationContainer || !this._paginationEnabled) {
        return;
      }

      const totalPages = this.getTotalPages();
      const currentPage = this._currentPage;

      // Update prev button state
      if (this._paginationPrev) {
        this._paginationPrev.style.pointerEvents = currentPage <= 1 ? "none" : "";
        this._paginationPrev.style.opacity = currentPage <= 1 ? "0.5" : "1";
      }

      // Update next button state
      if (this._paginationNext) {
        this._paginationNext.style.pointerEvents = currentPage >= totalPages ? "none" : "";
        this._paginationNext.style.opacity = currentPage >= totalPages ? "0.5" : "1";
      }

      // Render page numbers
      if (this._paginationPages) {
        this._paginationPages.innerHTML = this._renderPageNumbers(currentPage, totalPages);
      }

      // Show/hide ellipsis
      if (this._paginationEllipsis) {
        // Show ellipsis if there are more than 7 pages and we're not near the start or end
        const showEllipsis = totalPages > 7 && currentPage < totalPages - 2;
        this._paginationEllipsis.style.display = showEllipsis ? "flex" : "none";
      }

      // Setup click handlers for pagination
      this._setupPaginationClickHandlers();
    },

    /**
     * Render page numbers HTML
     * @param {Number} currentPage - Current page number
     * @param {Number} totalPages - Total number of pages
     * @return {String} HTML for page numbers
     */
    _renderPageNumbers(currentPage, totalPages) {
      if (totalPages <= 0) return "";

      let pages = [];
      
      if (totalPages <= 7) {
        // Show all pages
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show first few pages, current page, and last few pages
        if (currentPage <= 3) {
          pages = [1, 2, 3, 4, totalPages];
        } else if (currentPage >= totalPages - 2) {
          pages = [1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        } else {
          pages = [1, currentPage - 1, currentPage, currentPage + 1, totalPages];
        }
      }

      let html = "";
      let lastPage = 0;

      pages.forEach((page, idx) => {
        // Add ellipsis if there's a gap
        if (idx > 0 && page - lastPage > 1) {
          html += `<li style="display: inline-block;"><div style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;"><span>...</span></div></li>`;
        }

        const isActive = page === currentPage;
        const btnStyle = isActive
          ? "background-color: transparent; border: 1px solid var(--border); color: inherit;"
          : "background-color: transparent; border: none; color: inherit;";
        html += `
          <li style="display: inline-block;">
            <a href="#" class="pagination-page-btn ${isActive ? 'btn-icon-outline' : 'btn-icon-ghost'}" data-page="${page}" tabindex="0" style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; ${btnStyle} text-decoration: none; border-radius: var(--radius); cursor: pointer;">
              ${page}
            </a>
          </li>
        `;

        lastPage = page;
      });

      return html;
    },

    /**
     * Setup click handlers for pagination
     */
    _setupPaginationClickHandlers() {
      if (!this._paginationContainer) return;

      // Remove existing handler
      if (this._paginationClickHandler) {
        this._paginationContainer.removeEventListener("click", this._paginationClickHandler);
      }

      this._paginationClickHandler = (e) => {
        e.preventDefault();

        const target = e.target;
        
        // Check for prev button
        if (target.closest(".pagination-prev")) {
          this.previousPage();
          return;
        }

        // Check for next button
        if (target.closest(".pagination-next")) {
          this.nextPage();
          return;
        }

        // Check for page number button
        const pageBtn = target.closest(".pagination-page-btn");
        if (pageBtn) {
          const page = parseInt(pageBtn.getAttribute("data-page"));
          if (!isNaN(page)) {
            this.goToPage(page);
          }
        }
      };

      this._paginationContainer.addEventListener("click", this._paginationClickHandler);
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
     * @param {Object} rowDataObj - Optional data object to store with the row (for click events)
     */
    addRow(rowData, index = null, rowDataObj = null) {
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
        }),
        data: rowDataObj || null
      };

      // Store in all rows for pagination
      if (this._paginationEnabled) {
        if (index === null || index === undefined) {
          this._allRows.push(row);
        } else {
          this._allRows.splice(index, 0, row);
        }
        this._totalRows = this._allRows.length;
        this._updateCurrentPageRows();
      } else {
        if (index === null || index === undefined) {
          this._rows.push(row);
        } else {
          this._rows.splice(index, 0, row);
        }
      }

      this._renderTable();

      // Auto-adjust column widths after adding row if table is visible
      if (this._tableElement && !this._hasExplicitColumnWidths()) {
        qx.event.Timer.once(() => {
          this._autoAdjustColumnWidths();
        }, this, 100);
      }
    },

    /**
     * Update current page rows based on pagination state
     */
    _updateCurrentPageRows() {
      if (!this._paginationEnabled || this._allRows.length === 0) {
        this._rows = [];
        return;
      }

      const startIndex = (this._currentPage - 1) * this._pageSize;
      const endIndex = Math.min(startIndex + this._pageSize, this._allRows.length);

      this._rows = this._allRows.slice(startIndex, endIndex);
    },

    /**
     * Remove a row by index
     * @param {Number} index - Index of row to remove
     */
    removeRow(index) {
      if (this._paginationEnabled) {
        // Adjust index for all rows
        const actualIndex = (this._currentPage - 1) * this._pageSize + index;
        if (actualIndex >= 0 && actualIndex < this._allRows.length) {
          this._allRows.splice(actualIndex, 1);
          this._totalRows = this._allRows.length;
          this._updateCurrentPageRows();
          this._updatePagination();
          this._renderTable();
        }
      } else {
        if (index >= 0 && index < this._rows.length) {
          this._rows.splice(index, 1);
          this._renderTable();
        }
      }
    },

    /**
     * Clear all rows from the table body
     */
    clearRows() {
      if (this._paginationEnabled) {
        this._allRows = [];
        this._rows = [];
        this._totalRows = 0;
        this._updatePagination();
      } else {
        this._rows = [];
      }
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
     * Get all rows (or current page rows if pagination is enabled)
     * @return {Array} Array of row data
     */
    getRows() {
      const rows = this._paginationEnabled ? this._allRows : this._rows;
      return rows.map(row => ({
        cells: row.cells.map(cell => ({
          text: cell.text,
          classes: cell.classes,
          align: cell.align
        }))
      }));
    },

    /**
     * Get all rows regardless of pagination
     * @return {Array} Array of all row data
     */
    getAllRows() {
      return this._allRows.map(row => ({
        cells: row.cells.map(cell => ({
          text: cell.text,
          classes: cell.classes,
          align: cell.align
        }))
      }));
    },

    /**
     * Set all rows at once (useful for loading data)
     * @param {Array<Array>} rows - Array of row data arrays
     */
    setRows(rows) {
      if (!rows || !Array.isArray(rows)) {
        return;
      }

      this._allRows = rows.map(rowData => ({
        cells: (rowData || []).map(cell => {
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
        }),
        data: null
      }));

      this._totalRows = this._allRows.length;

      if (this._paginationEnabled) {
        this._currentPage = 1;
        this._updateCurrentPageRows();
        this._updatePagination();
      } else {
        this._rows = [...this._allRows];
      }

      this._renderTable();

      // Auto-adjust column widths after setting rows if table is visible
      if (this._tableElement && !this._hasExplicitColumnWidths()) {
        qx.event.Timer.once(() => {
          this._autoAdjustColumnWidths();
        }, this, 100);
      }
    },

    /**
     * Get row count (total or current page depending on pagination)
     * @return {Number} Number of rows
     */
    getRowCount() {
      return this._paginationEnabled ? this._totalRows : this._rows.length;
    },

    /**
     * Get total row count (all rows, not just current page)
     * @return {Number} Total number of rows
     */
    getTotalRowCount() {
      return this._totalRows;
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
        // Ensure header row has visible border and proper height
        headerRow.style.borderBottom = "1px solid var(--border)";
        headerRow.style.minHeight = "44px"; // Consistent header height
        headerRow.style.height = "auto"; // Allow height to adjust
        this._headers.forEach((headerText, index) => {
          const th = document.createElement("th");
          
          // Apply column width if explicitly set, otherwise let it auto-adjust
          if (this._columnWidths[index]) {
            th.style.width = this._columnWidths[index] + "px";
            th.style.minWidth = this._columnWidths[index] + "px";
            th.style.maxWidth = this._columnWidths[index] + "px";
          } else {
            // Allow auto-sizing but set minimum width
            th.style.minWidth = "80px"; // Minimum width to prevent too narrow columns
            th.style.width = "auto";
          }
          
          // Add cell borders
          th.style.borderRight = "1px solid var(--border)";
          th.style.borderBottom = "1px solid var(--border)";
          th.style.position = "relative";
          
          // Set content directly
          th.textContent = this._escapeHtml(headerText);
          
          // Add auto-adjusting padding for proper spacing
          th.style.padding = "12px 16px";
          th.style.paddingRight = index < this._headers.length - 1 ? "16px" : "12px";
          th.style.paddingLeft = index === 0 ? "16px" : "16px";
          th.style.verticalAlign = "middle";
          
          // Allow text to wrap if needed, but prefer single line
          th.style.overflow = "visible";
          th.style.textOverflow = "ellipsis";
          th.style.whiteSpace = "normal"; // Allow wrapping for long headers
          th.style.wordWrap = "break-word";
          
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
                th.style.borderRight = "2px solid var(--border)";
                resizeHandle.style.backgroundColor = "var(--muted)";
              }
            });
            resizeHandle.addEventListener("mouseleave", () => {
              if (!this._isResizing) {
                th.style.borderRight = "1px solid var(--border)";
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
        this._rows.forEach((row, rowIndex) => {
          const tr = document.createElement("tr");
          // Store row index and data for click events
          // If pagination is enabled, calculate actual index in all rows
          const actualIndex = this._paginationEnabled 
            ? (this._currentPage - 1) * this._pageSize + rowIndex 
            : rowIndex;
          tr.setAttribute("data-row-index", actualIndex);
          
          // Auto-adjust row height based on content
          tr.style.minHeight = "44px"; // Minimum row height for consistent spacing
          tr.style.height = "auto"; // Allow height to adjust based on content
          
          // Add hover effect for clickable rows
          tr.style.cursor = "pointer";
          tr.addEventListener("mouseenter", () => {
            tr.style.backgroundColor = "var(--muted)";
          });
          tr.addEventListener("mouseleave", () => {
            tr.style.backgroundColor = "";
          });
          
          row.cells.forEach((cell, index) => {
            const td = document.createElement("td");
            td.textContent = this._escapeHtml(cell.text);
            
            // Apply column width if explicitly set, otherwise let it auto-adjust
            if (this._columnWidths[index]) {
              td.style.width = this._columnWidths[index] + "px";
              td.style.minWidth = this._columnWidths[index] + "px";
              td.style.maxWidth = this._columnWidths[index] + "px";
            } else {
              // Allow auto-sizing but set minimum width
              td.style.minWidth = "80px"; // Minimum width to prevent too narrow columns
              td.style.width = "auto";
            }
            
            // Add cell borders
            td.style.borderRight = "1px solid var(--border)";
            td.style.borderBottom = "1px solid var(--border)";
            // Remove right border from last cell
            if (index === row.cells.length - 1) {
              td.style.borderRight = "none";
            }
            
            // Add auto-adjusting padding for proper spacing
            td.style.padding = "12px 16px";
            td.style.paddingRight = index < row.cells.length - 1 ? "16px" : "12px";
            td.style.paddingLeft = index === 0 ? "16px" : "16px";
            td.style.verticalAlign = "middle";
            td.style.lineHeight = "1.5";
            
            // Allow text wrapping for long content
            td.style.wordWrap = "break-word";
            td.style.overflowWrap = "break-word";
            td.style.whiteSpace = "normal"; // Allow wrapping
            td.style.overflow = "visible"; // Show full content
            
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
        
        // Setup row click events (only if tbody element exists and is in DOM)
        if (this._tbodyElement && this._tbodyElement.parentNode) {
          this._setupRowClickEvents();
        }
        
        // Auto-adjust column widths after rendering if no explicit widths are set
        if (this._rows.length > 0 && !this._hasExplicitColumnWidths()) {
          qx.event.Timer.once(() => {
            this._autoAdjustColumnWidths();
          }, this, 50);
        }
      }

      // Render footer rows
      if (this._tfootElement) {
        this._tfootElement.innerHTML = "";
        this._footerRows.forEach(row => {
          const tr = document.createElement("tr");
          // Auto-adjust footer row height based on content
          tr.style.minHeight = "44px";
          tr.style.height = "auto";
          
          row.cells.forEach((cell, index) => {
            const td = document.createElement("td");
            td.textContent = this._escapeHtml(cell.text);
            
            // Apply column width if set (only if no colspan)
            if (!cell.colspan || cell.colspan === 1) {
              if (this._columnWidths[index]) {
                td.style.width = this._columnWidths[index] + "px";
                td.style.minWidth = this._columnWidths[index] + "px";
                td.style.maxWidth = this._columnWidths[index] + "px";
              } else {
                // Allow auto-sizing but set minimum width
                td.style.minWidth = "80px";
                td.style.width = "auto";
              }
            }
            
            // Add cell borders
            td.style.borderRight = "1px solid var(--border)";
            td.style.borderBottom = "1px solid var(--border)";
            // Remove right border from last cell (unless it has colspan)
            if (index === row.cells.length - 1 && (!cell.colspan || cell.colspan === 1)) {
              td.style.borderRight = "none";
            }
            
            // Add auto-adjusting padding for proper spacing (consistent with body rows)
            td.style.padding = "12px 16px";
            td.style.paddingRight = index < row.cells.length - 1 ? "16px" : "12px";
            td.style.paddingLeft = index === 0 ? "16px" : "16px";
            td.style.verticalAlign = "middle";
            td.style.lineHeight = "1.5";
            
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
     * Setup row click events
     */
    _setupRowClickEvents() {
      if (!this._tbodyElement) {
        return;
      }

      // Remove existing listener if any (to avoid duplicates)
      if (this._rowClickHandler) {
        this._tbodyElement.removeEventListener("click", this._rowClickHandler);
      }

      // Use event delegation for row clicks
      this._rowClickHandler = (e) => {
        const tr = e.target.closest("tr");
        if (!tr) {
          return;
        }

        const rowIndex = parseInt(tr.getAttribute("data-row-index"));
        const rows = this._paginationEnabled ? this._allRows : this._rows;
        if (isNaN(rowIndex) || rowIndex < 0 || rowIndex >= rows.length) {
          return;
        }

        const row = rows[rowIndex];
        this.fireDataEvent("rowClick", {
          rowIndex: rowIndex,
          rowData: row.data || null
        });
      };

      this._tbodyElement.addEventListener("click", this._rowClickHandler);
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
        th.style.borderRight = "2px solid var(--border)";
        handle.style.backgroundColor = "var(--muted)";
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
            th.style.borderRight = "1px solid var(--border)";
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
     * Check if any explicit column widths are set
     * @return {Boolean} True if any column widths are explicitly set
     */
    _hasExplicitColumnWidths() {
      return this._columnWidths && this._columnWidths.some(width => width !== null && width !== undefined);
    },

    /**
     * Auto-adjust column widths based on content
     * With tableLayout: auto, the browser should handle this, but we ensure
     * cells can expand to fit their content
     */
    _autoAdjustColumnWidths() {
      if (!this._tableElement || !this._tbodyElement || this._rows.length === 0) {
        return;
      }

      const numColumns = this._headers.length;
      if (numColumns === 0) {
        return;
      }

      // For columns without explicit widths, ensure they can auto-expand
      const headerRow = this._theadElement ? this._theadElement.querySelector("tr") : null;
      const rows = this._tbodyElement.querySelectorAll("tr");
      
      for (let i = 0; i < numColumns; i++) {
        // Only adjust if no explicit width is set
        if (!this._columnWidths[i]) {
          // Remove any width constraints to allow natural sizing
          if (headerRow && headerRow.children[i]) {
            const th = headerRow.children[i];
            th.style.width = "";
            th.style.minWidth = "80px"; // Keep minimum
            th.style.maxWidth = ""; // Remove max constraint
          }
          
          // Update all body cells in this column
          rows.forEach(tr => {
            if (tr.children[i]) {
              const td = tr.children[i];
              td.style.width = "";
              td.style.minWidth = "80px"; // Keep minimum
              td.style.maxWidth = ""; // Remove max constraint
            }
          });
        }
      }
      
      // Force a reflow to let the browser recalculate with auto layout
      if (this._tableElement) {
        this._tableElement.offsetHeight; // Force reflow
      }
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
