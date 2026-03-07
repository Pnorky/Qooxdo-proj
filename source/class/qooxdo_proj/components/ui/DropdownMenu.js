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

    this._dropdownId = "dropdown-" + qx.core.Id.getInstance().toHashCode(this);
    this._triggerId = this._dropdownId + "-trigger";
    this._popoverId = this._dropdownId + "-popover";
    this._menuId = this._dropdownId + "-menu";

    this._menuItems = [];
    this._selectedItem = null;

    this._buildTrigger();
    this._buildMenu();

    // Use popup for the dropdown menu
    this._popup = new qx.ui.popup.Popup(new qx.ui.layout.Grow()).set({
      autoHide: true,
      keepActive: true,
      offset: 4,
      position: "bottom-left"
    });
    this._popup.add(this._menuContainer);

    this._popup.addListener("appear", () => {
      this._syncAria(true);
      this.fireEvent("open");
      // Re-render menu when popup appears to ensure DOM is ready
      this._renderMenu();
    }, this);
    this._popup.addListener("disappear", () => {
      this._syncAria(false);
      this.fireEvent("close");
    }, this);

    // Toggle on pointerdown
    this._triggerHtml.addListener("pointerdown", (e) => {
      if (e.stopPropagation) e.stopPropagation();
      this.toggle(e);
    }, this);

    this._triggerHtml.addListenerOnce("appear", () => {
      this._applyTriggerLabel(this.getTriggerLabel());
      this._applyMenuSizing();
    });
  },

  members: {
    _triggerHtml: null,
    _menuContainer: null,
    _menuHtml: null,
    _popup: null,
    _dropdownId: null,
    _triggerId: null,
    _popoverId: null,
    _menuId: null,
    _menuItems: null,
    _selectedItem: null,
    _mobileSidePadding: 12,

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

    _buildMenu() {
      this._menuContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
      this._menuContainer.setMinWidth(224); // min-w-56 = 224px

      this._menuHtml = new qx.ui.embed.Html(`
        <div id="${this._popoverId}" data-popover aria-hidden="true" class="min-w-56" 
          style="background:var(--popover); color:var(--popover-foreground); border:1px solid var(--border); border-radius:var(--radius); box-shadow: var(--shadow-lg); width:14rem; box-sizing:border-box; overflow:hidden;">
          <div role="menu" id="${this._menuId}" aria-labelledby="${this._triggerId}" style="padding:0.25rem;"></div>
        </div>
      `);
      this._menuContainer.add(this._menuHtml);

      this._menuHtml.addListenerOnce("appear", () => {
        this._applyMenuSizing();
      });
    },

    _escapeHtml(text) {
      if (!text) return "";
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    },

    _getTriggerElement() {
      if (!this._triggerHtml || !this._triggerHtml.getContentElement()) return null;
      const host = this._triggerHtml.getContentElement().getDomElement();
      return host ? host.querySelector("#" + this._triggerId) : null;
    },

    _getMenuElement() {
      if (!this._menuHtml || !this._menuHtml.getContentElement()) return null;
      const host = this._menuHtml.getContentElement().getDomElement();
      return host ? host.querySelector("#" + this._menuId) : null;
    },

    _syncAria(open) {
      const trigger = this._getTriggerElement();
      const menu = this._getMenuElement();
      if (trigger) trigger.setAttribute("aria-expanded", open ? "true" : "false");
      if (menu) menu.parentElement.setAttribute("aria-hidden", open ? "false" : "true");
    },

    _getViewportWidth() {
      return window.innerWidth || document.documentElement.clientWidth || 1200;
    },

    _getResponsiveMenuWidth(width) {
      const viewportWidth = this._getViewportWidth();
      const safeWidth = viewportWidth - (this._mobileSidePadding * 2);
      return Math.max(160, Math.min(width || 224, safeWidth));
    },

    _applyTriggerLabel(value) {
      const trigger = this._getTriggerElement();
      if (trigger) trigger.textContent = value || "Open";
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
      const popover = this._getMenuElement()?.parentElement;
      const responsiveWidth = this._getResponsiveMenuWidth(sizing.px || 224);
      if (popover) {
        popover.classList.remove("min-w-56", "min-w-48", "min-w-64");
        popover.classList.add(sizing.className || "min-w-56");
        popover.style.width = sizing.cssWidth || (responsiveWidth + "px");
        popover.style.maxWidth = `calc(100vw - ${this._mobileSidePadding * 2}px)`;
        popover.style.boxSizing = "border-box";
      }
      const width = responsiveWidth;
      
      if (this._menuContainer) {
        this._menuContainer.setMinWidth(width);
      }
      if (this._popup) {
        this._popup.setMinWidth(width);
        this._popup.setWidth(width);
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
      const menu = this._getMenuElement();
      if (!menu) return;

      let html = "";
      let currentGroup = null;

      for (let i = 0; i < this._menuItems.length; i++) {
        const item = this._menuItems[i];

        // Handle separator
        if (item.separator) {
          html += `<hr role="separator" style="margin:0.25rem 0;border:0;border-top:1px solid var(--border);" />`;
          continue;
        }

        // Handle group header
        if (item.group && item.group !== currentGroup) {
          currentGroup = item.group;
          const groupId = "group-" + item.group;
          html += `
            <div role="group" aria-labelledby="${groupId}" style="padding:0.25rem 0;">
              <div role="heading" id="${groupId}" style="padding:0.5rem 0.75rem 0.25rem;font-size:0.75rem;font-weight:600;color:var(--muted-foreground);text-transform:uppercase;letter-spacing:0.05em;">
                ${this._escapeHtml(item.groupLabel || item.group)}
              </div>
          `;
        }

        // Build menu item HTML
        const isSelected = this._selectedItem && this._selectedItem.value === item.value;
        const isDisabled = item.disabled ? "aria-disabled=\"true\" style=\"opacity:0.5;pointer-events:none;\"" : "";
        
        let itemHtml = `
          <div role="menuitem" 
            data-value="${this._escapeHtml(item.value)}"
            tabindex="${item.disabled ? -1 : 0}"
            ${isDisabled}
            style="display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0.75rem;font-size:0.875rem;line-height:1.25;cursor:pointer;border-radius:var(--radius);${isSelected ? 'background:var(--accent);color:var(--accent-foreground);' : ''}"
          >
            <span>${this._escapeHtml(item.label)}</span>
        `;

        // Add shortcut if present
        if (item.shortcut) {
          itemHtml += `
            <span class="text-muted-foreground ml-auto text-xs tracking-widest" style="color:var(--muted-foreground);margin-left:auto;font-size:0.75rem;">
              ${this._escapeHtml(item.shortcut)}
            </span>
          `;
        }

        itemHtml += `</div>`;
        html += itemHtml;

        // Close group div if next item is different group or at end
        if (i < this._menuItems.length - 1) {
          const nextItem = this._menuItems[i + 1];
          if (nextItem.group !== currentGroup && currentGroup !== null) {
            html += `</div>`;
          }
        } else if (currentGroup !== null) {
          html += `</div>`;
        }
      }

      menu.innerHTML = html;

      // Add click listeners to menu items
      const menuItems = menu.querySelectorAll('[role="menuitem"][data-value]');
      menuItems.forEach((el) => {
        el.addEventListener("click", (e) => {
          const value = el.getAttribute("data-value");
          this._selectItem(value);
        });
      });
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
      if (!this._popup) return;
      if (this._popup.isVisible()) return;

      // Ensure size is set before showing
      const width = this._getResponsiveMenuWidth(this._menuContainer.getMinWidth() || 224);
      this._popup.setMinWidth(width);
      this._popup.setWidth(width);

      if (this._popup.placeToWidget) {
        this._popup.placeToWidget(this._triggerHtml, true);
      }
      this._popup.show();
    },

    hide() {
      if (!this._popup) return;
      this._popup.hide();
    },

    toggle(e) {
      if (this.getOpen()) {
        this.hide();
      } else {
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
    this._disposeObjects("_popup", "_triggerHtml", "_menuContainer", "_menuHtml");
  }
});
