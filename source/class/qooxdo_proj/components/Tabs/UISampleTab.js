/* ************************************************************************

   Copyright: 2026 

   License: MIT license

   Authors: 

************************************************************************ */

qx.Class.define("qooxdo_proj.components.Tabs.UISampleTab", {
  extend: qx.ui.tabview.Page,

  construct: function () {
    this.base(arguments, "UI Components Demo");
    this.setLayout(new qx.ui.layout.VBox(10));
    this.setPadding(10);

    // outer container to center content
    const outer = new qx.ui.container.Composite(new qx.ui.layout.HBox());
    outer.setAlignX("center");
    this.add(outer);

    const wrapper = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    wrapper.setWidth(600);
    outer.add(wrapper);

    const addSectionTitle = function (text) {
      const title = new qooxdo_proj.components.ui.Label(text);
      title.setFont("bold");
      wrapper.add(title);
    };

    // Accordion demo
    addSectionTitle("Accordion");
    const accordion = new qooxdo_proj.components.ui.Accordion();
    accordion.setItems([
      { summary: "Section 1", content: "This is the content of section 1." },
      { summary: "Section 2", content: "Another piece of content in section 2." }
    ]);
    wrapper.add(accordion);

    // Card demo
    addSectionTitle("Card");
    const card = new qooxdo_proj.components.ui.Card("Sample Card", "A subtitle for the card");
    card.getSection().add(new qooxdo_proj.components.ui.Label("Card body content goes here."));
    wrapper.add(card);

    // CheckBox demo
    addSectionTitle("CheckBox");
    const checkbox = new qooxdo_proj.components.ui.CheckBox("I'm a custom checkbox");
    checkbox.addListener("changeValue", function (e) {
      const state = e.getData();
      checkbox.setLabel("I'm a custom checkbox (" + (state ? "checked" : "unchecked") + ")");
    });
    wrapper.add(checkbox);

    // Dialog demo
    addSectionTitle("Dialog");
    const dialog = new qooxdo_proj.components.ui.Dialog("Demo Dialog", "This dialog was opened from the UI demo tab.");
    dialog.setSectionContent("Dialog body content can be plain text or HTML.");
    const dialogStatus = new qooxdo_proj.components.ui.Label("Dialog status: idle");
    dialog.addListener("save", function () {
      dialogStatus.setValue("Dialog status: saved");
    });
    dialog.addListener("cancel", function () {
      dialogStatus.setValue("Dialog status: cancelled");
    });
    // add dialog to layout so its DOM exists when show() is called
    wrapper.add(dialog);

    const showDialogBtn = new qooxdo_proj.components.ui.Button("Show Dialog", "primary", "sm");
    showDialogBtn.addListener("execute", function () {
      dialog.show();
    });
    showDialogBtn.setBasecoatToolTip("Open a Basecoat dialog", "top", "center");
    wrapper.add(showDialogBtn);
    wrapper.add(dialogStatus);

    // Popover demo
    addSectionTitle("Popover");
    const popover = new qooxdo_proj.components.ui.Popover("Help", "Popover Title", "Short description");
    popover.setRichSectionContent(true);
    popover.setSectionContent("This is some popover content. You can include <strong>HTML</strong> if you set richSectionContent.");
    wrapper.add(popover);

  }
});