/* ************************************************************************

   Copyright: 2026

   License: MIT license

   Authors:

************************************************************************ */
/**
 * Basecoat-style DropdownMenu component using qooxdoo Popup behavior.
 * Combines basecoat's dropdown menu HTML with qooxdoo's SelectBox functionality.
 *
 * Basecoat HTML equivalent:
 * <div class="dropdown-menu">
 *   <button type="button" class="btn-outline">Open</button>
 *   <div class="min-w-56">
 *     <div role="menu">
 *       <div role="group" aria-labelledby="account-options">
 *         <div role="heading">My Account</div>
 *         <div role="menuitem">Profile</div>
 *         <div role="menuitem">Billing</div>
 *       </div>
 *       <hr role="separator" />
 *       <div role="menuitem">GitHub</div>
 *     </div>
 *   </div>
 * </div>
 */
qx.Class.define("qooxdo_proj.components.ui.DropdownMenu", {
    extend: qx.ui.core.Widget,
    properties: {
        /** Label for the trigger button */
        triggerLabel: {
            check: "String",
            init: "Open",
            apply: "_applyTriggerLabel"
        },
        /** Width of the dropdown menu */
        menuWidth: {
            check: "String",
            init: "min-w-56",
            apply: "_applyMenuSizing"
        },
        size: {
            check: ["sm", "md", "lg", "xl", "custom"],
            init: "md",
            apply: "_applyMenuSizing"
        },
        dropdownMaxWidth: {
            check: "String",
            init: "",
            apply: "_applyMenuSizing"
        },
        /** Currently selected value */
        value: {
            check: "String",
            init: null,
            apply: "_applyValue",
            event: "changeValue"
        }
    },
    events: {
        /** Fired when an item is selected. Data: {value: string, label: string} */
        "changeSelection": "qx.event.type.Data",
        /** Fired when the dropdown opens */
        "open": "qx.event.type.Event",
        /** Fired when the dropdown closes */
        "close": "qx.event.type.Event"
    },
    construct(triggerLabel = "Open") {
        this.base(arguments);
        this._setLayout(new qx.ui.layout.Canvas());
        this._dropdownId = "dropdown-" + this.toHashCode();
        this._triggerId = this._dropdownId + "-trigger";
        this._popoverId = this._dropdownId + "-popover";
        this._menuId = this._dropdownId + "-menu";
        this._menuItems = [];
        this._selectedItem = null;
        this._buildTrigger();
        // Popup — no child widgets; we inject HTML directly into the popup's own DOM
        this._popup = new qx.ui.popup.Popup(new qx.ui.layout.Canvas()).set({
            autoHide: true,
            keepActive: true,
            offset: 4,
            position: "bottom-left",
            minWidth: 224,
            minHeight: 32
        });
        this._popup.addListener("appear", () => {
            this._syncAria(true);
            this.fireEvent("open");
            this._injectMenuIntoPopupDom();
        }, this);
        this._popup.addListener("disappear", () => {
            this._syncAria(false);
            this.fireEvent("close");
        }, this);
        // Toggle on pointerdown
        this._triggerHtml.addListener("pointerdown", (e) => {
            if (e.stopPropagation)
                e.stopPropagation();
            this.toggle(e);
        }, this);
        this._triggerHtml.addListenerOnce("appear", () => {
            this._applyTriggerLabel(this.getTriggerLabel());
        });
    },
    members: {
        _triggerHtml: null,
        _popup: null,
        _popupDom: null, // direct reference to the popup's DOM element
        _menuDom: null, // direct reference to the injected menu div
        _dropdownId: null,
        _triggerId: null,
        _popoverId: null,
        _menuId: null,
        _menuItems: null,
        _selectedItem: null,
        _mobileSidePadding: 12,
        _renderRetryScheduled: false,
        _buildTrigger() {
            const triggerLabel = this._escapeHtml(this.getTriggerLabel());
            this._triggerHtml = new qx.ui.embed.Html(`
        <div class="qx-dropdown-trigger" style="display:inline-block;">
          <button id="${this._triggerId}" type="button" class="btn-outline" aria-haspopup="menu" aria-controls="${this._menuId}" aria-expanded="false">
            ${triggerLabel}
          </button>
        </div>
      `);
            this._add(this._triggerHtml, { edge: 0 });
        },
        // Injects the menu HTML directly into the popup's own DOM element.
        // This is reliable because the popup DOM is always ready when "appear" fires.
        _injectMenuIntoPopupDom() {
            const popupContentEl = this._popup.getContentElement
                ? this._popup.getContentElement()
                : null;
            if (!popupContentEl)
                return;
            const popupDom = popupContentEl.getDomElement
                ? popupContentEl.getDomElement()
                : null;
            if (!popupDom)
                return;
            this._popupDom = popupDom;
            // Style the popup container itself
            popupDom.style.background = "var(--popover)";
            popupDom.style.color = "var(--popover-foreground)";
            popupDom.style.border = "1px solid var(--border)";
            popupDom.style.borderRadius = "var(--radius)";
            popupDom.style.boxShadow = "var(--shadow-lg)";
            popupDom.style.overflow = "hidden";
            popupDom.style.boxSizing = "border-box";
            popupDom.style.padding = "0";
            // Create or reuse the menu div inside the popup
            let menuDiv = popupDom.querySelector("#" + this._menuId);
            if (!menuDiv) {
                menuDiv = document.createElement("div");
                menuDiv.setAttribute("role", "menu");
                menuDiv.id = this._menuId;
                menuDiv.setAttribute("aria-labelledby", this._triggerId);
                menuDiv.style.padding = "0.25rem";
                popupDom.appendChild(menuDiv);
            }
            this._menuDom = menuDiv;
            this._renderMenu();
            qx.event.Timer.once(() => this._sizePopupToContent(), this, 20);
        },
        _escapeHtml(text) {
            if (!text)
                return "";
            const div = document.createElement("div");
            div.textContent = text;
            return div.innerHTML;
        },
        _getTriggerElement() {
            if (!this._triggerHtml || !this._triggerHtml.getContentElement())
                return null;
            const host = this._triggerHtml.getContentElement().getDomElement();
            return host ? host.querySelector("#" + this._triggerId) : null;
        },
        _getMenuElement() {
            return this._menuDom || null;
        },
        _syncAria(open) {
            const trigger = this._getTriggerElement();
            if (trigger)
                trigger.setAttribute("aria-expanded", open ? "true" : "false");
        },
        _getViewportWidth() {
            return window.innerWidth || document.documentElement.clientWidth || 1200;
        },
        _getResponsiveMenuWidth(width) {
            const viewportWidth = this._getViewportWidth();
            const safeWidth = viewportWidth - (this._mobileSidePadding * 2);
            return Math.max(160, Math.min(width || 224, safeWidth));
        },
        _composeMenuHtml(itemsHtml) {
            return `
        <div id="${this._popoverId}" data-popover aria-hidden="true" class="min-w-56" 
          style="background:var(--popover, #ffffff); color:var(--popover-foreground, #111827); border:1px solid var(--border, #e5e7eb); border-radius:var(--radius, 0.5rem); box-shadow: var(--shadow-lg, 0 8px 24px rgba(0,0,0,0.14)); width:14rem; box-sizing:border-box; overflow:hidden;">
          <div role="menu" id="${this._menuId}" aria-labelledby="${this._triggerId}" style="display:block; width:100%; padding:0.25rem; color:var(--popover-foreground, #111827); box-sizing:border-box; max-height:min(22rem, calc(100vh - 2rem)); overflow-y:auto;">
            ${itemsHtml || ""}
          </div>
        </div>
      `;
        },
        _applyTriggerLabel(value) {
            const trigger = this._getTriggerElement();
            if (trigger)
                trigger.textContent = value || "Open";
        },
        _resolveMenuSizing() {
            const size = this.getSize ? this.getSize() : "md";
            const maxWidth = this.getDropdownMaxWidth ? this.getDropdownMaxWidth() : "";
            const menuWidth = this.getMenuWidth ? this.getMenuWidth() : "min-w-56";
            const widthBySize = {
                sm: { className: "min-w-48", px: 192 },
                md: { className: "min-w-56", px: 224 },
                lg: { className: "min-w-64", px: 256 },
                xl: { className: "min-w-64", px: 320 }
            };
            const classWidthMap = {
                "min-w-48": 192,
                "min-w-56": 224,
                "min-w-64": 256
            };
            if (size === "custom" || (maxWidth && maxWidth.trim() !== "")) {
                const raw = (maxWidth || "").trim();
                const px = raw.endsWith("px") ? parseInt(raw, 10) : null;
                return {
                    className: menuWidth || "min-w-56",
                    px: px && !isNaN(px) ? px : (classWidthMap[menuWidth] || 224),
                    cssWidth: raw || null
                };
            }
            const preset = widthBySize[size] || widthBySize.md;
            return {
                className: preset.className,
                px: preset.px,
                cssWidth: null
            };
        },
        _applyMenuSizing() {
            const sizing = this._resolveMenuSizing();
            const width = sizing.px || 224;
            if (this._popup) {
                this._popup.setMinWidth(width);
                this._popup.setWidth(width);
            }
            if (this._popupDom) {
                this._popupDom.style.width = width + "px";
                this._popupDom.style.minWidth = width + "px";
            }
        },
        _sizePopupToContent() {
            if (!this._menuDom || !this._popup)
                return;
            const h = this._menuDom.scrollHeight || this._menuDom.offsetHeight;
            if (h > 4) {
                this._popup.setMinHeight(h);
                this._popup.setHeight(h);
                if (this._popupDom) {
                    this._popupDom.style.height = h + "px";
                }
            }
        },
        _applyValue(value) {
            const items = this._menuItems;
            for (let i = 0; i < items.length; i++) {
                if (items[i].value === value) {
                    this._selectedItem = items[i];
                    this._updateSelectedDisplay(items[i].label);
                    break;
                }
            }
        },
        _updateSelectedDisplay(label) {
            const trigger = this._getTriggerElement();
            if (trigger) {
                trigger.textContent = label || this.getTriggerLabel();
            }
        },
        /**
         * Add a menu item
         * @param {String} label - Display label
         * @param {String} value - Internal value
         * @param {Object} options - Additional options (icon, shortcut, disabled, separator)
         */
        addItem(label, value, options = {}) {
            const item = {
                label: label,
                value: value,
                icon: options.icon || null,
                shortcut: options.shortcut || null,
                disabled: options.disabled || false,
                separator: options.separator || false,
                group: options.group || null,
                groupLabel: options.groupLabel || null
            };
            this._menuItems.push(item);
            this._renderMenu();
            return this;
        },
        /**
         * Clear all menu items
         */
        clearItems() {
            this._menuItems = [];
            this._selectedItem = null;
            this._renderMenu();
            return this;
        },
        /**
         * Render the menu items
         */
        _renderMenu() {
            let html = "";
            let currentGroup = null;
            const closeCurrentGroup = () => {
                if (currentGroup !== null) {
                    html += `</div>`;
                    currentGroup = null;
                }
            };
            for (let i = 0; i < this._menuItems.length; i++) {
                const item = this._menuItems[i];
                // separator:true means "add a divider line BEFORE this item, then render the item"
                if (item.separator) {
                    // Close any open group first
                    if (currentGroup !== null) {
                        html += `</div>`;
                        currentGroup = null;
                    }
                    html += `<hr role="separator" style="margin:0.25rem 0;border:0;border-top:1px solid var(--border);" />`;
                }
                // Handle group header
                if (item.group && item.group !== currentGroup) {
                    if (currentGroup !== null) {
                        html += `</div>`;
                    }
                    currentGroup = item.group;
                    const groupId = "group-" + item.group;
                    html += `
            <div role="group" aria-labelledby="${groupId}" style="display:block; width:100%; padding:0.25rem 0; box-sizing:border-box;">
              <div role="heading" id="${groupId}" style="display:block; width:100%; padding:0.45rem 0.75rem 0.2rem; font-size:0.75rem; font-weight:600; color:var(--muted-foreground, #6b7280); text-transform:uppercase; letter-spacing:0.05em; line-height:1.2; box-sizing:border-box;">
                ${this._escapeHtml(item.groupLabel || item.group)}
              </div>
          `;
                }
                else {
                    closeCurrentGroup();
                }
                // Build menu item HTML
                const isSelected = this._selectedItem && this._selectedItem.value === item.value;
                const disabledAttrs = item.disabled ? `aria-disabled="true" style="display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0.75rem;font-size:0.875rem;line-height:1.25;cursor:default;border-radius:var(--radius);opacity:0.5;pointer-events:none;"` : "";
                const activeStyle = isSelected ? "background:var(--accent);color:var(--accent-foreground);" : "";
                let itemHtml = `
          <div role="menuitem"
            data-value="${this._escapeHtml(item.value)}"
            tabindex="${item.disabled ? -1 : 0}"
            ${disabledAttrs || `style="display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0.75rem;font-size:0.875rem;line-height:1.25;cursor:pointer;border-radius:var(--radius);${activeStyle}"`}
          >
            <span style="display:block; color:inherit; white-space:normal; overflow-wrap:anywhere;">${this._escapeHtml(item.label)}</span>
        `;
                if (item.shortcut) {
                    itemHtml += `<span style="color:var(--muted-foreground);margin-left:auto;font-size:0.75rem;">${this._escapeHtml(item.shortcut)}</span>`;
                }
                itemHtml += `</div>`;
                html += itemHtml;
                // Close open group at last item
                if (i === this._menuItems.length - 1 && currentGroup !== null) {
                    html += `</div>`;
                }
            }
            closeCurrentGroup();
            const renderedMenu = this._getMenuElement();
            if (!renderedMenu) {
                if (!this._renderRetryScheduled) {
                    this._renderRetryScheduled = true;
                    qx.event.Timer.once(() => {
                        this._renderRetryScheduled = false;
                        this._renderMenu();
                    }, this, 0);
                }
                return;
            }
            renderedMenu.innerHTML = html;
            renderedMenu.onclick = (ev) => {
                const target = ev.target;
                const itemEl = target && target.closest
                    ? target.closest('[role="menuitem"][data-value]')
                    : null;
                if (!itemEl)
                    return;
                const value = itemEl.getAttribute("data-value");
                if (value != null) {
                    this._selectItem(value);
                }
            };
            this._applyMenuSizing();
            // Re-fit popup height whenever menu is re-rendered while open
            if (this._popup && this._popup.isVisible()) {
                qx.event.Timer.once(() => this._sizePopupToContent(), this, 20);
            }
        },
        _selectItem(value) {
            for (let i = 0; i < this._menuItems.length; i++) {
                if (this._menuItems[i].value === value && !this._menuItems[i].disabled) {
                    this._selectedItem = this._menuItems[i];
                    this.setValue(value);
                    this._updateSelectedDisplay(this._menuItems[i].label);
                    this.hide();
                    this.fireDataEvent("changeSelection", {
                        value: this._menuItems[i].value,
                        label: this._menuItems[i].label
                    });
                    break;
                }
            }
        },
        show(e) {
            if (!this._popup)
                return;
            if (this._popup.isVisible())
                return;
            if (this._popup.placeToWidget) {
                this._popup.placeToWidget(this._triggerHtml, true);
            }
            this._popup.show();
        },
        hide() {
            if (!this._popup)
                return;
            this._popup.hide();
        },
        toggle(e) {
            if (this.getOpen()) {
                this.hide();
            }
            else {
                this.show(e);
            }
        },
        getOpen() {
            return this._popup ? this._popup.isVisible() : false;
        },
        /**
         * Get all menu items
         * @return {Array}
         */
        getItems() {
            return this._menuItems;
        },
        /**
         * Get selected item
         * @return {Object|null}
         */
        getSelectedItem() {
            return this._selectedItem;
        }
    },
    destruct() {
        this._popupDom = null;
        this._menuDom = null;
        this._disposeObjects("_popup", "_triggerHtml");
    }
});
