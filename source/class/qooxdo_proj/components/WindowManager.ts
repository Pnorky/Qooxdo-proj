/* ************************************************************************
   Copyright: 2026
************************************************************************ */

qx.Class.define("qooxdo_proj.components.WindowManager", {
  extend: qx.core.Object,

  members: {
    _windows: null as Record<string, any> | null,
    _root: null as any,
    _mobileBreakpoint: 900,

    init: function (root: any): void {
      (this as any)._root = root;
      (this as any)._windows = {};
    },

    _fitWindowForViewport: function (win: any): void {
      if (!win || !(this as any)._root) return;
      let rootWidth = window.innerWidth || 1200;
      let rootHeight = window.innerHeight || 800;
      try {
        const innerSize = (this as any)._root.getInnerSize ? (this as any)._root.getInnerSize() : null;
        if (innerSize) {
          rootWidth = innerSize.width || rootWidth;
          rootHeight = innerSize.height || rootHeight;
        }
      } catch (_e) {}

      if (rootWidth > this._mobileBreakpoint) return;
      const margin = 12;
      const topOffset = 64;
      const availableWidth = Math.max(280, rootWidth - (margin * 2));
      const availableHeight = Math.max(240, rootHeight - topOffset - margin);
      const currentWidth = win.getWidth ? (win.getWidth() || 600) : 600;
      const currentHeight = win.getHeight ? (win.getHeight() || 500) : 500;
      win.setWidth(Math.min(currentWidth, availableWidth));
      win.setHeight(Math.min(currentHeight, availableHeight));
      win.moveTo(margin, topOffset);
    },

    registerWindow: function (windowId: string, window: any, options?: any): any {
      const windows = (this as any)._windows;
      if (windows[windowId]) {
        const existingWin = windows[windowId];
        existingWin.open();
        if (existingWin.toFront) existingWin.toFront();
        return existingWin;
      }
      const defaultOptions = { left: 50, top: 50, open: true };
      const finalOptions = qx.lang.Object.mergeWith(defaultOptions, options || {});
      (this as any)._root.add(window, { left: finalOptions.left, top: finalOptions.top });
      windows[windowId] = window;
      if (finalOptions.open !== false) window.open();
      return window;
    },

    openWindow: function (windowId: string): void {
      const win = (this as any)._windows[windowId];
      if (!win) return;
      win.open();
      if (win.toFront) win.toFront();
      this._fitWindowForViewport(win);
    },

    closeWindow: function (windowId: string): void {
      const win = (this as any)._windows[windowId];
      if (win) win.close();
    },

    closeAllWindows: function (): void {
      const windows = (this as any)._windows || {};
      Object.keys(windows).forEach((windowId) => {
        const win = windows[windowId];
        if (win && win.close) {
          win.close();
        }
      });
    },

    cascadeWindows: function (): void {
      const windows = (this as any)._windows || {};
      const openWindows = Object.keys(windows)
        .map((windowId) => windows[windowId])
        .filter((win) => win && win.isVisible && win.isVisible());

      if (!openWindows.length) return;

      const startX = 48;
      const startY = 72;
      const step = 28;

      openWindows.forEach((win, index) => {
        if (win.moveTo) {
          win.moveTo(startX + (index * step), startY + (index * step));
        }
        if (win.toFront) {
          win.toFront();
        }
      });
    },

    tileWindows: function (): void {
      const windows = (this as any)._windows || {};
      const openWindows = Object.keys(windows)
        .map((windowId) => windows[windowId])
        .filter((win) => win && win.isVisible && win.isVisible());

      const count = openWindows.length;
      if (!count) return;

      let rootWidth = window.innerWidth || 1200;
      let rootHeight = window.innerHeight || 800;
      try {
        const innerSize = (this as any)._root && (this as any)._root.getInnerSize
          ? (this as any)._root.getInnerSize()
          : null;
        if (innerSize) {
          rootWidth = innerSize.width || rootWidth;
          rootHeight = innerSize.height || rootHeight;
        }
      } catch (_e) {}

      const topOffset = 64;
      const margin = 10;
      const availableWidth = Math.max(320, rootWidth - (margin * 2));
      const availableHeight = Math.max(240, rootHeight - topOffset - margin);

      const cols = Math.max(1, Math.ceil(Math.sqrt(count)));
      const rows = Math.max(1, Math.ceil(count / cols));
      const cellWidth = Math.max(220, Math.floor(availableWidth / cols));
      const cellHeight = Math.max(180, Math.floor(availableHeight / rows));

      openWindows.forEach((win, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = margin + (col * cellWidth);
        const y = topOffset + (row * cellHeight);

        if (win.setWidth) win.setWidth(cellWidth - 8);
        if (win.setHeight) win.setHeight(cellHeight - 8);
        if (win.moveTo) win.moveTo(x, y);
        if (win.toFront) win.toFront();
      });
    },

    getAllWindows: function (): Record<string, any> {
      return (this as any)._windows || {};
    }
  }
});
