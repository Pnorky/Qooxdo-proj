/* ************************************************************************

   Copyright: 2026 

   License: MIT license

   Authors: 

************************************************************************ */

qx.Class.define("qooxdo_proj.components.WindowManager",
{
  extend : qx.core.Object,

  members :
  {
    _windows : null,
    _root : null,

    /**
     * Initialize the window manager
     * @param {qx.ui.root.Abstract} root - The root container
     */
    init : function(root)
    {
      this._root = root;
      this._windows = {};
    },

    /**
     * Register a window component
     * @param {String} windowId - Unique identifier for the window
     * @param {qx.ui.window.Window} window - Window component instance
     * @param {Object} options - Window position options (left, top)
     * @return {qx.ui.window.Window} The registered window
     */
    registerWindow : function(windowId, window, options)
    {
      // If window already exists, just open it
      if (this._windows[windowId]) {
        const existingWin = this._windows[windowId];
        existingWin.open();
        // Use toFront() to bring window to front in Qooxdoo
        if (existingWin.toFront) {
          existingWin.toFront();
        }
        return existingWin;
      }

      // Set default position options
      const defaultOptions = {
        left: 50,
        top: 50,
        open: true  // Whether to open the window immediately
      };

      const finalOptions = qx.lang.Object.mergeWith(defaultOptions, options || {});

      // Add to root
      this._root.add(window, { 
        left: finalOptions.left, 
        top: finalOptions.top 
      });

      // Store window reference
      this._windows[windowId] = window;

      // Open the window only if specified
      if (finalOptions.open !== false) {
        window.open();
      }

      // Handle close event
      window.addListener("close", () => {
        // Optionally remove from registry on close
        // delete this._windows[windowId];
      }, this);
      
      // Listen for window open events to ensure other widgets stay on top if needed
      window.addListener("appear", () => {
        // When a window appears, we can optionally raise other widgets
        // This is handled by the Application class
      }, this);

      return window;
    },

    /**
     * Create and register a window
     * @param {String} windowId - Unique identifier for the window
     * @param {String} title - Window title
     * @param {String} icon - Icon path (optional)
     * @param {qx.ui.core.Widget} content - Content widget to add to window
     * @param {Object} options - Window options (left, top, width, height, etc.)
     * @return {qx.ui.window.Window} The created window
     */
    createWindow : function(windowId, title, icon, content, options)
    {
      // If window already exists, just open it
      if (this._windows[windowId]) {
        const existingWin = this._windows[windowId];
        existingWin.open();
        // Use toFront() to bring window to front in Qooxdoo
        if (existingWin.toFront) {
          existingWin.toFront();
        }
        return existingWin;
      }

      // Create new window
      const win = new qx.ui.window.Window(title, icon);
      win.setLayout(new qx.ui.layout.VBox(10));
      win.setShowStatusbar(true);
      win.setStatus("Ready");
      
      // Set default options
      const defaultOptions = {
        left: 50,
        top: 50,
        width: 600,
        height: 500,
        allowClose: true,
        allowMaximize: true,
        allowMinimize: true,
        showClose: true,
        showMaximize: true,
        showMinimize: true,
        resizable: true,
        movable: true
      };

      const finalOptions = qx.lang.Object.mergeWith(defaultOptions, options || {});
      
      // Apply options
      if (finalOptions.width) win.setWidth(finalOptions.width);
      if (finalOptions.height) win.setHeight(finalOptions.height);
      if (finalOptions.allowClose !== undefined) win.setAllowClose(finalOptions.allowClose);
      if (finalOptions.allowMaximize !== undefined) win.setAllowMaximize(finalOptions.allowMaximize);
      if (finalOptions.allowMinimize !== undefined) win.setAllowMinimize(finalOptions.allowMinimize);
      if (finalOptions.showClose !== undefined) win.setShowClose(finalOptions.showClose);
      if (finalOptions.showMaximize !== undefined) win.setShowMaximize(finalOptions.showMaximize);
      if (finalOptions.showMinimize !== undefined) win.setShowMinimize(finalOptions.showMinimize);
      if (finalOptions.resizable !== undefined) {
        win.setResizableTop(finalOptions.resizable);
        win.setResizableRight(finalOptions.resizable);
        win.setResizableBottom(finalOptions.resizable);
        win.setResizableLeft(finalOptions.resizable);
      }
      if (finalOptions.movable !== undefined) win.setMovable(finalOptions.movable);

      // Add content
      if (content) {
        win.add(content, { flex: 1 });
      }

      // Add to root
      this._root.add(win, { 
        left: finalOptions.left, 
        top: finalOptions.top 
      });

      // Store window reference
      this._windows[windowId] = win;

      // Open the window
      win.open();

      // Handle close event to remove from registry if needed
      win.addListener("close", () => {
        // Optionally remove from registry on close
        // delete this._windows[windowId];
      }, this);

      return win;
    },

    /**
     * Get a window by ID
     * @param {String} windowId - Window identifier
     * @return {qx.ui.window.Window|null} The window or null if not found
     */
    getWindow : function(windowId)
    {
      return this._windows[windowId] || null;
    },

    /**
     * Open a window by ID
     * @param {String} windowId - Window identifier
     */
    openWindow : function(windowId)
    {
      const win = this._windows[windowId];
      if (win) {
        win.open();
        // Use toFront() to bring window to front in Qooxdoo
        if (win.toFront) {
          win.toFront();
        }
      }
    },

    /**
     * Close a window by ID
     * @param {String} windowId - Window identifier
     */
    closeWindow : function(windowId)
    {
      const win = this._windows[windowId];
      if (win) {
        win.close();
      }
    },

    /**
     * Close all windows
     */
    closeAllWindows : function()
    {
      for (const windowId in this._windows) {
        if (this._windows[windowId]) {
          this._windows[windowId].close();
        }
      }
    },


    /**
     * Cascade all open windows
     */
    cascadeWindows : function()
    {
      let left = 50;
      let top = 50;
      const offset = 30;

      for (const windowId in this._windows) {
        const win = this._windows[windowId];
        if (win && win.isVisible()) {
          win.moveTo(left, top);
          // Use toFront() to bring window to front in Qooxdoo
          if (win.toFront) {
            win.toFront();
          }
          left += offset;
          top += offset;
        }
      }
    },

    /**
     * Tile all open windows
     */
    tileWindows : function()
    {
      const visibleWindows = [];
      for (const windowId in this._windows) {
        const win = this._windows[windowId];
        if (win && win.isVisible()) {
          visibleWindows.push(win);
        }
      }

      if (visibleWindows.length === 0) return;

      // Get root dimensions - use inner size if available, otherwise use bounds
      let rootWidth = 1200;
      let rootHeight = 800;
      try {
        const innerSize = this._root.getInnerSize();
        if (innerSize) {
          rootWidth = innerSize.width || 1200;
          rootHeight = innerSize.height || 800;
        } else {
          const bounds = this._root.getBounds();
          if (bounds) {
            rootWidth = bounds.width || 1200;
            rootHeight = bounds.height || 800;
          }
        }
      } catch (e) {
        // Use defaults if we can't get dimensions
      }

      const cols = Math.ceil(Math.sqrt(visibleWindows.length));
      const rows = Math.ceil(visibleWindows.length / cols);
      const windowWidth = Math.floor((rootWidth - 100) / cols);
      const windowHeight = Math.floor((rootHeight - 100) / rows);

      let index = 0;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols && index < visibleWindows.length; col++) {
          const win = visibleWindows[index];
          win.moveTo(50 + col * windowWidth, 50 + row * windowHeight);
          win.setWidth(Math.max(300, windowWidth - 20));
          win.setHeight(Math.max(200, windowHeight - 20));
          index++;
        }
      }
    },

    /**
     * Get all registered windows
     * @return {Object} Object containing all windows
     */
    getAllWindows : function()
    {
      return this._windows;
    }
  }
});
