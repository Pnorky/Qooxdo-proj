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
    this._setLayout(new qx.ui.layout.HBox(6).set({
      alignX: "center",
      alignY: "middle"
    }));
    this.setAllowGrowX(false);
    this.setAllowShrinkX(true);
    this.setMinWidth(0);

    // Create the pagination container
    this._createPaginationUI();
    this.addListener("appear", this._applyResponsiveLayout, this);
    this.addListener("resize", this._applyResponsiveLayout, this);
    qx.event.Timer.once(this._applyResponsiveLayout, this, 0);
  },

  members: {
    _prevButton: null,
    _nextButton: null,
    _pageNumbers: null,
    _ellipsis: null,
    _mobileBreakpoint: 900,

    /**
     * Create the pagination UI
     */
    _createPaginationUI() {
      // Previous button
      this._prevButton = new qooxdo_proj.components.ui.Button("Previous", "ghost");
      this._prevButton.setMinWidth(90);
      this._prevButton.setWidth(90);
      this._prevButton.setAllowGrowX(false);
      this._prevButton.setAllowShrinkX(false);
      this._prevButton.addListener("execute", this._onPrevClick, this);

      // Container for page numbers
      this._pageNumbers = new qx.ui.container.Composite();
      this._pageNumbers._setLayout(new qx.ui.layout.HBox(4));
      this._pageNumbers.setAllowGrowX(false);
      this._pageNumbers.setAllowShrinkX(true);
      this._pageNumbers.setMinWidth(0);

      // Ellipsis
      this._ellipsis = new qx.ui.basic.Label("...")
        .set({
          padding: [8, 8],
          alignX: "center",
          textAlign: "center"
        });
      this._ellipsis.setMinWidth(28);

      // Next button
      this._nextButton = new qooxdo_proj.components.ui.Button("Next", "ghost");
      this._nextButton.setMinWidth(80);
      this._nextButton.setWidth(80);
      this._nextButton.setAllowGrowX(false);
      this._nextButton.setAllowShrinkX(false);
      this._nextButton.addListener("execute", this._onNextClick, this);

      // Add components
      this._add(this._prevButton);
      this._add(this._pageNumbers);
      this._add(this._nextButton);

      // Update UI
      this._updatePagination();
    },

    _applyResponsiveLayout() {
      const isMobile = (window.innerWidth || 1200) <= this._mobileBreakpoint;
      if (!this._prevButton || !this._nextButton || !this._pageNumbers) return;

      this._setLayout(new qx.ui.layout.HBox(isMobile ? 6 : 10).set({
        alignX: "center",
        alignY: "middle"
      }));
      if (isMobile) {
        this._prevButton.setLabel("Prev");
        this._nextButton.setLabel("Next");
        this._prevButton.setMinWidth(74);
        this._prevButton.setWidth(74);
        this._nextButton.setMinWidth(66);
        this._nextButton.setWidth(66);
      } else {
        this._prevButton.setLabel("Previous");
        this._nextButton.setLabel("Next");
        this._prevButton.setMinWidth(90);
        this._prevButton.setWidth(90);
        this._nextButton.setMinWidth(80);
        this._nextButton.setWidth(80);
      }
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
        const btn = new qooxdo_proj.components.ui.Button(
          String(page),
          isActive ? "outline" : "ghost"
        );
        btn.setMinWidth(40);
        btn.setWidth(40);
        btn.setAllowGrowX(false);
        btn.setAllowShrinkX(false);

        btn.addListener("execute", () => {
          this._onPageClick(page);
        }, this);

        this._pageNumbers.add(btn);
      });
    }
  }
});
