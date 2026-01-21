/* ************************************************************************

   Copyright: 2026 

   License: MIT license

   Authors: 

************************************************************************ */

qx.Class.define("qooxdo_proj.components.CounterButtons",
{
  extend : qx.ui.container.Composite,

  events :
  {
    /** Fired when press me button is clicked. Data: {count: number} */
    "pressMe" : "qx.event.type.Data",
    
    /** Fired when reset counter button is clicked */
    "resetCounter" : "qx.event.type.Event"
  },

  construct : function()
  {
    this.base(arguments);
    this.setLayout(new qx.ui.layout.HBox(10));
    
    this._clickCount = 0;
    this._createButtons();
  },

  members :
  {
    _pressMeButton : null,
    _resetCounterButton : null,
    _clickCount : 0,

    _createButtons : function()
    {
      this._pressMeButton = new qx.ui.form.Button("Press Me");
      this._resetCounterButton = new qx.ui.form.Button("Reset Counter");

      this._pressMeButton.addListener("execute", () => {
        this._clickCount++;
        this.fireDataEvent("pressMe", {
          count: this._clickCount,
          message: `Button clicked ${this._clickCount} time${this._clickCount !== 1 ? 's' : ''}`
        });
      });

      this._resetCounterButton.addListener("execute", () => {
        this._clickCount = 0;
        this.fireEvent("resetCounter");
      });

      this.add(this._pressMeButton);
      this.add(this._resetCounterButton);
    },

    // Public methods
    getCount : function()
    {
      return this._clickCount;
    },

    resetCount : function()
    {
      this._clickCount = 0;
    },

    // Get button references if needed
    getPressMeButton : function()
    {
      return this._pressMeButton;
    },

    getResetCounterButton : function()
    {
      return this._resetCounterButton;
    }
  }
});
