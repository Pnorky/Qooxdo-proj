/* ************************************************************************

   Copyright: 2026

   License: MIT license

   Authors:

************************************************************************ */

qx.Class.define("qooxdo_proj.components.Tabs.UITabToastSampleTab", {
  extend: qx.ui.tabview.Page,

  construct: function () {
    this.base(arguments, "TabView + Toast Demo");
    this.setLayout(new qx.ui.layout.VBox(10));
    this.setPadding(10);

    const outer = new qx.ui.container.Composite(new qx.ui.layout.HBox());
    outer.setAlignX("center");
    this.add(outer);

    const wrapper = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    // allow wrapper to expand up to a reasonable maximum but not force a fixed width
    wrapper.setMaxWidth(800);
    wrapper.setWidth(null);
    outer.add(wrapper);

    const addSectionTitle = function (text) {
      const title = new qooxdo_proj.components.ui.Label(text);
      title.setFont("bold");
      wrapper.add(title);
    };

    const toaster = new qooxdo_proj.components.ui.Toast();
    this.add(toaster, { flex: 0 });

    addSectionTitle("TabView + TabPage");
    const customTabs = new qooxdo_proj.components.ui.TabView();
    customTabs.setRichContent(true);
    customTabs.add(new qooxdo_proj.components.ui.TabPage(
      "Account",
      `
      <div class="card">
        <header>
          <h2>Account</h2>
          <p>Make changes to your account here.</p>
        </header>
        <section>
          <form class="form grid gap-3">
            <div class="grid gap-2">
              <label>Name</label>
              <input type="text" value="Pedro Duarte" />
            </div>
            <div class="grid gap-2">
              <label>Username</label>
              <input type="text" value="@peduarte" />
            </div>
          </form>
        </section>
      </div>
      `,
      true
    ));
    customTabs.add(new qooxdo_proj.components.ui.TabPage(
      "Password",
      `
      <div class="card">
        <header>
          <h2>Password</h2>
          <p>Change your password here.</p>
        </header>
        <section>
          <form class="form grid gap-3">
            <div class="grid gap-2">
              <label>Current password</label>
              <input type="password" />
            </div>
            <div class="grid gap-2">
              <label>New password</label>
              <input type="password" />
            </div>
          </form>
        </section>
      </div>
      `,
      true
    ));
    wrapper.add(customTabs);

    addSectionTitle("Toast");
    const toastButtonsRow = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
    toastButtonsRow.setAlignX("center");
    toastButtonsRow.setAllowGrowX(true);
    const toastFrontendBtn = new qooxdo_proj.components.ui.Button("Toast from front-end", "outline", "sm");
    toastFrontendBtn.addListener("execute", function () {
      toaster.show({
        category: "success",
        title: "Success",
        description: "A success toast called from the front-end.",
        cancel: { label: "Dismiss" }
      });
    });
    toastFrontendBtn.setBasecoatToolTip("Calls toaster.show(...)", "bottom", "start");
    toastButtonsRow.add(toastFrontendBtn);

    const toastEventBtn = new qooxdo_proj.components.ui.Button("Toast from event", "outline", "sm");
    toastEventBtn.addListener("execute", function () {
      document.dispatchEvent(new CustomEvent("basecoat:toast", {
        detail: {
          config: {
            category: "info",
            title: "Event Toast",
            description: "Triggered via basecoat:toast custom event.",
            cancel: { label: "Dismiss" }
          }
        }
      }));
    });
    toastEventBtn.setBasecoatToolTip("Dispatches basecoat:toast", "bottom", "center");
    toastButtonsRow.add(toastEventBtn);

    wrapper.add(toastButtonsRow);

    addSectionTitle("RadioButton (Basecoat Style)");
    const radioButtonsRow = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
    radioButtonsRow.setAlignX("center");

    // Create a radio button group
    const radioGroup = new qooxdo_proj.components.ui.RadioButtonGroup();
    radioGroup.setGroupName("demo-radio-group");

    // Add radio buttons
    const rb1 = new qooxdo_proj.components.ui.RadioButton("Default");
    rb1.setValue("default");
    rb1.setChecked(true);

    const rb2 = new qooxdo_proj.components.ui.RadioButton("Comfortable");
    rb2.setValue("comfortable");

    const rb3 = new qooxdo_proj.components.ui.RadioButton("Compact");
    rb3.setValue("compact");

    radioGroup.add(rb1);
    radioGroup.add(rb2);
    radioGroup.add(rb3);

    // Listen for selection changes
    radioGroup.addListener("changeSelection", function(e) {
      toaster.show({
        category: "info",
        title: "Radio Selected",
        description: "Selected: " + e.getData().value,
        cancel: { label: "Dismiss" }
      });
    });

    radioButtonsRow.add(radioGroup);
    wrapper.add(radioButtonsRow);
  }
});
