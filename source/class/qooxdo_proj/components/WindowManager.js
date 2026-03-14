/* ************************************************************************
   Copyright: 2026
************************************************************************ */
qx.Class.define("qooxdo_proj.components.WindowManager", {
    extend: qx.core.Object,
    members: {
        _windows: null,
        _root: null,
        _mobileBreakpoint: 900,
        init: function (root) {
            this._root = root;
            this._windows = {};
        },
        _fitWindowForViewport: function (win) {
            if (!win || !this._root)
                return;
            let rootWidth = window.innerWidth || 1200;
            let rootHeight = window.innerHeight || 800;
            try {
                const innerSize = this._root.getInnerSize ? this._root.getInnerSize() : null;
                if (innerSize) {
                    rootWidth = innerSize.width || rootWidth;
                    rootHeight = innerSize.height || rootHeight;
                }
            }
            catch (_e) { }
            if (rootWidth > this._mobileBreakpoint)
                return;
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
        registerWindow: function (windowId, window, options) {
            const windows = this._windows;
            if (windows[windowId]) {
                const existingWin = windows[windowId];
                existingWin.open();
                if (existingWin.toFront)
                    existingWin.toFront();
                return existingWin;
            }
            const defaultOptions = { left: 50, top: 50, open: true };
            const finalOptions = qx.lang.Object.mergeWith(defaultOptions, options || {});
            this._root.add(window, { left: finalOptions.left, top: finalOptions.top });
            windows[windowId] = window;
            if (finalOptions.open !== false)
                window.open();
            return window;
        },
        openWindow: function (windowId) {
            const win = this._windows[windowId];
            if (!win)
                return;
            win.open();
            if (win.toFront)
                win.toFront();
            this._fitWindowForViewport(win);
        },
        closeWindow: function (windowId) {
            const win = this._windows[windowId];
            if (win)
                win.close();
        },
        getAllWindows: function () {
            return this._windows || {};
        }
    }
});
