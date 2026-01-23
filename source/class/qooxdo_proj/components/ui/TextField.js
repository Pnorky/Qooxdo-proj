qx.Class.define("myTasks.components.ui.TextField", {
  extend: qx.ui.container.Composite,

  properties: {
    value: {
      check: "String",
      init: "",
      apply: "_applyValue"
    }
  },

  construct(placeholder = "", type = "text") {
    super(new qx.ui.layout.Canvas());

    // Create HTML for Basecoat input
    const name = placeholder.toLowerCase().replace(/\s+/g, '-');
    this._html = new qx.ui.embed.Html(`
      <div style="margin: 4px;">
        <input name="${name}" class="input" type="${type}" placeholder="${placeholder}">
      </div>
    `);
    this._html.setMargin(2);

    this.add(this._html, { edge: 0 });
  },

  members: {
    _applyValue(value) {
      const name = this._html.getContentElement().getDomElement().querySelector("input").getAttribute("name");
      const input = document.querySelector(`input[name="${name}"]`);
      if (input) input.value = value;
    },

    getValue() {
      const name = this._html.getContentElement().getDomElement().querySelector("input").getAttribute("name");
      const input = document.querySelector(`input[name="${name}"]`);
      return input ? input.value : "";
    }
  }
});