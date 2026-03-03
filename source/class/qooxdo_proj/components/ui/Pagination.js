/* ************************************************************************

   Project: qooxdo_proj
   Component: Pagination UI

   Copyright: 2026

   License: MIT

************************************************************************ */

qx.Class.define("qooxdo_proj.components.ui.Pagination", {
  extend: qx.ui.core.Widget,

  properties: {
    /** Current page number (1-based) */
    currentPage: {
      check: "Number",
      init: 1,
      apply: "_applyCurrentPage",
      event: "changeCurrentPage"
    },

    /** Total number of pages */
    totalPages: {
      check: "Number",
      init: 0,
      apply: "_applyTotalPages",
      event: "changeTotalPages"
    },

    /** Number of visible page numbers to show */
    maxVisiblePages: {
      check: "Number",
      init: 5
    }
  },

  events: {
    /** Fired when page changes. Data: {page: number} */
    "changePage": "qx.event.type.Data"
  },

  construct() {
    this.base(arguments);

    // Set layout
    this._setLayout(new qx.ui.layout.HBox(10).set({
      alignX: "center",
      alignY: "middle"
    }));

    // Create the pagination container
    this._createPaginationUI();
  },

  members: {
    _prevButton: null,
    _nextButton: null,
    _pageNumbers: null,
    _ellipsis: null,

    /**
     * Create the pagination UI
     */
    _createPaginationUI() {
      // Previous button
      this._prevButton = new qx.ui.form.Button("Previous")
        .set({
          appearance: "button-standard",
          padding: [8, 12],
          cursor: "pointer"
        });
      this._prevButton.addListener("execute", this._onPrevClick, this);

      // Container for page numbers
      this._pageNumbers = new qx.ui.container.Composite();
      this._pageNumbers._setLayout(new qx.ui.layout.HBox(4));

      // Ellipsis
      this._ellipsis = new qx.ui.basic.Label("...")
        .set({
          padding: [8, 4]
        });

      // Next button
      this._nextButton = new qx.ui.form.Button("Next")
        .set({
          appearance: "button-standard",
          padding: [8, 12],
          cursor: "pointer"
        });
      this._nextButton.addListener("execute", this._onNextClick, this);

      // Add components
      this._add(this._prevButton);
      this._add(this._pageNumbers);
      this._add(this._nextButton);

      // Update UI
      this._updatePagination();
    },

    /**
     * Handle previous button click
     */
    _onPrevClick() {
      if (this.getCurrentPage() > 1) {
        this.setCurrentPage(this.getCurrentPage() - 1);
      }
    },

    /**
     * Handle next button click
     */
    _onNextClick() {
      if (this.getCurrentPage() < this.getTotalPages()) {
        this.setCurrentPage(this.getCurrentPage() + 1);
      }
    },

    /**
     * Handle page number click
     */
    _onPageClick(page) {
      this.setCurrentPage(page);
    },

    /**
     * Apply currentPage changes
     */
    _applyCurrentPage(currentPage) {
      this._updatePagination();
      this.fireDataEvent("changePage", { page: currentPage });
    },

    /**
     * Apply totalPages changes
     */
    _applyTotalPages(totalPages) {
      this._updatePagination();
    },

    /**
     * Update pagination UI
     */
    _updatePagination() {
      const currentPage = this.getCurrentPage();
      const totalPages = this.getTotalPages();
      const maxVisible = this.getMaxVisiblePages();

      // Update prev/next button states
      if (this._prevButton) {
        this._prevButton.setEnabled(currentPage > 1);
      }
      if (this._nextButton) {
        this._nextButton.setEnabled(currentPage < totalPages);
      }

      // Update page numbers
      this._renderPageNumbers(currentPage, totalPages, maxVisible);
    },

    /**
     * Render page numbers
     */
    _renderPageNumbers(currentPage, totalPages, maxVisible) {
      if (!this._pageNumbers) return;

      this._pageNumbers.removeAll();

      if (totalPages <= 0) return;

      let pages = [];

      if (totalPages <= maxVisible) {
        // Show all pages
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show limited pages with ellipsis
        const half = Math.floor(maxVisible / 2);
        let start = currentPage - half;
        let end = currentPage + half;

        if (start <= 1) {
          start = 1;
          end = maxVisible;
        }

        if (end >= totalPages) {
          end = totalPages;
          start = totalPages - maxVisible + 1;
        }

        // Add first page and ellipsis if needed
        if (start > 1) {
          pages.push(1);
          if (start > 2) {
            // Add ellipsis
            this._pageNumbers.add(this._ellipsis);
          }
        }

        // Add middle pages
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }

        // Add last page and ellipsis if needed
        if (end < totalPages) {
          if (end < totalPages - 1) {
            // Add ellipsis
            this._pageNumbers.add(this._ellipsis);
          }
          pages.push(totalPages);
        }
      }

      // Create page number buttons
      pages.forEach((page) => {
        const isActive = page === currentPage;
        const btn = new qx.ui.form.Button(String(page))
          .set({
            padding: [8, 12],
            cursor: "pointer",
            appearance: isActive ? "button-primary" : "button-standard"
          });

        // Style active button differently
        if (isActive) {
          btn.addListenerOnce("appear", () => {
            const dom = btn.getContentElement() && btn.getContentElement().getDomElement();
            if (dom) {
              dom.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
              dom.style.fontWeight = "bold";
            }
          });
        }

        btn.addListener("execute", () => {
          this._onPageClick(page);
        }, this);

        this._pageNumbers.add(btn);
      });
    }
  }
});
