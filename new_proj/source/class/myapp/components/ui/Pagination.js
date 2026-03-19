/* ************************************************************************

   Project: myapp
   Component: Pagination UI (Basecoat styling, matches Table pagination)

   Copyright: 2026

   License: MIT

************************************************************************ */
qx.Class.define("myapp.components.ui.Pagination", {
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
        /** Number of visible page numbers to show (unused when using Table-style logic) */
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
        this._setLayout(new qx.ui.layout.Canvas());
        this._paginationId = "pagination-" + this.toHashCode();
        this._html = new qx.ui.embed.Html(`
      <nav role="navigation" aria-label="pagination" class="pagination-container mx-auto flex w-full justify-center" id="${this._paginationId}" style="display: flex; flex-shrink: 0; padding: 16px 0; margin-top: 0; border-top: 1px solid var(--border); width: 100%; min-width: 0; overflow: visible;">
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
    `);
        this._add(this._html, { edge: 0 });
        // Ensure full bar is visible (Previous + pages + Next) instead of collapsing
        this.setMinWidth(380);
        this._html.addListenerOnce("appear", () => {
            const container = this._html.getContentElement().getDomElement();
            this._paginationContainer = container.querySelector("#" + this._paginationId) || container;
            this._paginationPages = this._paginationContainer.querySelector(".pagination-pages");
            this._paginationPrev = this._paginationContainer.querySelector(".pagination-prev");
            this._paginationNext = this._paginationContainer.querySelector(".pagination-next");
            this._paginationEllipsis = this._paginationContainer.querySelector(".pagination-ellipsis");
            this._updatePagination();
            this._setupPaginationClickHandlers();
        });
    },
    members: {
        _html: null,
        _paginationId: null,
        _paginationContainer: null,
        _paginationPages: null,
        _paginationPrev: null,
        _paginationNext: null,
        _paginationEllipsis: null,
        _paginationClickHandler: null,
        _applyCurrentPage() {
            this._updatePagination();
            this.fireDataEvent("changePage", { page: this.getCurrentPage() });
        },
        _applyTotalPages() {
            this._updatePagination();
        },
        _updatePagination() {
            if (!this._paginationContainer)
                return;
            const totalPages = this.getTotalPages();
            const currentPage = this.getCurrentPage();
            if (this._paginationPrev) {
                this._paginationPrev.style.pointerEvents = currentPage <= 1 ? "none" : "";
                this._paginationPrev.style.opacity = currentPage <= 1 ? "0.5" : "1";
            }
            if (this._paginationNext) {
                this._paginationNext.style.pointerEvents = currentPage >= totalPages ? "none" : "";
                this._paginationNext.style.opacity = currentPage >= totalPages ? "0.5" : "1";
            }
            if (this._paginationPages) {
                this._paginationPages.innerHTML = this._renderPageNumbers(currentPage, totalPages);
            }
            if (this._paginationEllipsis) {
                const showEllipsis = totalPages > 7 && currentPage < totalPages - 2;
                this._paginationEllipsis.style.display = showEllipsis ? "flex" : "none";
            }
            this._setupPaginationClickHandlers();
        },
        _renderPageNumbers(currentPage, totalPages) {
            if (totalPages <= 0)
                return "";
            let pages = [];
            if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                }
            }
            else {
                if (currentPage <= 3) {
                    pages = [1, 2, 3, 4, totalPages];
                }
                else if (currentPage >= totalPages - 2) {
                    pages = [1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                }
                else {
                    pages = [1, currentPage - 1, currentPage, currentPage + 1, totalPages];
                }
            }
            let html = "";
            let lastPage = 0;
            pages.forEach((page, idx) => {
                if (idx > 0 && page - lastPage > 1) {
                    html += `<li style="display: inline-block;"><div style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;"><span>...</span></div></li>`;
                }
                const isActive = page === currentPage;
                const btnStyle = isActive
                    ? "background-color: transparent; border: 1px solid var(--border); color: inherit;"
                    : "background-color: transparent; border: none; color: inherit;";
                html += `
          <li style="display: inline-block;">
            <a href="#" class="pagination-page-btn ${isActive ? "btn-icon-outline" : "btn-icon-ghost"}" data-page="${page}" tabindex="0" style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; ${btnStyle} text-decoration: none; border-radius: var(--radius); cursor: pointer;">
              ${page}
            </a>
          </li>
        `;
                lastPage = page;
            });
            return html;
        },
        _setupPaginationClickHandlers() {
            if (!this._paginationContainer)
                return;
            if (this._paginationClickHandler) {
                this._paginationContainer.removeEventListener("click", this._paginationClickHandler);
            }
            this._paginationClickHandler = (e) => {
                e.preventDefault();
                const target = e.target;
                if (target.closest(".pagination-prev")) {
                    if (this.getCurrentPage() > 1) {
                        this.setCurrentPage(this.getCurrentPage() - 1);
                    }
                    return;
                }
                if (target.closest(".pagination-next")) {
                    if (this.getCurrentPage() < this.getTotalPages()) {
                        this.setCurrentPage(this.getCurrentPage() + 1);
                    }
                    return;
                }
                const pageBtn = target.closest(".pagination-page-btn");
                if (pageBtn) {
                    const page = parseInt(pageBtn.getAttribute("data-page"), 10);
                    if (!isNaN(page)) {
                        this.setCurrentPage(page);
                    }
                }
            };
            this._paginationContainer.addEventListener("click", this._paginationClickHandler);
        }
    },
    destruct() {
        if (this._paginationContainer && this._paginationClickHandler) {
            this._paginationContainer.removeEventListener("click", this._paginationClickHandler);
            this._paginationClickHandler = null;
        }
    }
});
