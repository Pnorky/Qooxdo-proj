/**
 * Simple patient information system (in-memory) using pure qooxdoo components.
 * @asset(myapp/*)
 */
qx.Class.define("myapp.Application", {
  extend: qx.application.Standalone,

  members: {
    __loginView: null as any,
    __dashboardView: null as any,
    __loginError: null as any,
    __patients: null as any,
    __sessionAdded: 0,
    __searchQuery: "",
    __tableModel: null as any,
    __statusLabel: null as any,
    __kpiTotal: null as any,
    __kpiSession: null as any,
    __kpiToday: null as any,
    __searchField: null as any,
    __nameField: null as any,
    __ageField: null as any,
    __sexSelect: null as any,
    __contactField: null as any,
    __addressField: null as any,
    __lastVisitField: null as any,

    main(): void {
      (this as any).base(arguments);
      const root = this.getRoot();

      this.__patients = [];
      this.__sessionAdded = 0;
      this.__searchQuery = "";

      this.__loginView = this._buildLoginView();
      this.__dashboardView = this._buildDashboardView();
      this.__dashboardView.setVisibility("excluded");

      root.add(this.__loginView, { edge: 0 });
      root.add(this.__dashboardView, { edge: 0 });

      this._applyThemeRoot();
      this._refreshView();
    },

    _buildLoginView(): any {
      const wrapper = new qx.ui.container.Composite(new qx.ui.layout.VBox());
      wrapper.addListenerOnce("appear", () => {
        const dom = wrapper.getContentElement()?.getDomElement();
        if (dom) {
          dom.style.backgroundColor = "var(--background)";
        }
      });

      const topSpacer = new qx.ui.core.Spacer();
      const row = new qx.ui.container.Composite(new qx.ui.layout.HBox());
      const bottomSpacer = new qx.ui.core.Spacer();

      const leftSpacer = new qx.ui.core.Spacer();
      const rightSpacer = new qx.ui.core.Spacer();
      const center = new qx.ui.groupbox.GroupBox();
      center.setLayout(new qx.ui.layout.VBox(12));
      center.setPadding(28);
      center.setMaxWidth(620);
      center.setWidth(560);

      const title = new qx.ui.basic.Label("Patient Information System");
      title.setFont("bold");
      this._styleText(title, 26, "700", "1.25");
      const subtitle = new qx.ui.basic.Label("Admin Login");
      this._styleText(subtitle, 16, "500", "1.3", "0.85");

      const username = new qx.ui.form.TextField();
      username.setPlaceholder("Username");
      const password = new qx.ui.form.PasswordField();
      password.setPlaceholder("Password");

      this.__loginError = new qx.ui.basic.Label("");
      this.__loginError.setVisibility("excluded");
      this.__loginError.addListenerOnce("appear", () => {
        const el = this.__loginError.getContentElement()?.getDomElement();
        if (!el) return;
        el.style.color = "var(--destructive)";
        el.style.lineHeight = "1.35";
        el.style.fontSize = "14px";
      });

      const loginBtn = new qx.ui.form.Button("Sign In");
      loginBtn.addListener("execute", () => {
        const user = String(username.getValue() || "").trim();
        const pass = String(password.getValue() || "");
        if (user === "admin" && pass === "admin") {
          this.__loginError.setValue("");
          this.__loginError.setVisibility("excluded");
          username.setValue("");
          password.setValue("");
          this.__loginView.setVisibility("excluded");
          this.__dashboardView.setVisibility("visible");
        } else {
          this.__loginError.setValue("Invalid admin credentials. Use admin / admin");
          this.__loginError.setVisibility("visible");
        }
      });

      center.add(title);
      center.add(subtitle);
      center.add(username);
      center.add(password);
      center.add(loginBtn);
      center.add(this.__loginError);

      row.add(leftSpacer, { flex: 1 });
      row.add(center);
      row.add(rightSpacer, { flex: 1 });

      wrapper.add(topSpacer, { flex: 1 });
      wrapper.add(row);
      wrapper.add(bottomSpacer, { flex: 1 });
      return wrapper;
    },

    _buildDashboardView(): any {
      const page = new qx.ui.container.Composite(new qx.ui.layout.VBox(14));
      page.setPadding(18);

      page.add(this._buildTopBar());
      page.add(this._buildKpiStrip());

      const grid = new qx.ui.container.Composite(new qx.ui.layout.HBox(12));
      grid.add(this._buildPatientListPanel(), { flex: 3 });
      grid.add(this._buildPatientFormPanel(), { flex: 2 });
      page.add(grid, { flex: 1 });

      return page;
    },

    _buildTopBar(): any {
      const bar = new qx.ui.container.Composite(new qx.ui.layout.HBox(10).set({ alignY: "middle" }));
      const title = new qx.ui.basic.Label("Patient Information Dashboard");
      title.setFont("bold");
      this._styleText(title, 24, "700", "1.25");

      const spacer = new qx.ui.core.Spacer();

      const themeBtn = new qx.ui.form.Button("Toggle Dark Mode");
      themeBtn.addListener("execute", () => {
        document.documentElement.classList.toggle("dark");
        this._applyThemeRoot();
      });

      const logoutBtn = new qx.ui.form.Button("Logout");
      logoutBtn.addListener("execute", () => {
        this.__dashboardView.setVisibility("excluded");
        this.__loginView.setVisibility("visible");
      });

      bar.add(title);
      bar.add(spacer, { flex: 1 });
      bar.add(themeBtn);
      bar.add(logoutBtn);
      return bar;
    },

    _buildKpiStrip(): any {
      const row = new qx.ui.container.Composite(new qx.ui.layout.HBox(12));
      this.__kpiTotal = this._createKpiCard("Total Patients");
      this.__kpiSession = this._createKpiCard("Added This Session");
      this.__kpiToday = this._createKpiCard("Last Visit Today");
      row.add(this.__kpiTotal, { flex: 1 });
      row.add(this.__kpiSession, { flex: 1 });
      row.add(this.__kpiToday, { flex: 1 });
      return row;
    },

    _createKpiCard(title: string): any {
      const card = new qx.ui.groupbox.GroupBox();
      card.setLayout(new qx.ui.layout.VBox(4));
      card.setMinHeight(92);
      card.add(this._createSectionHeader(title));
      const value = new qx.ui.basic.Label("0");
      value.setFont("bold");
      this._styleText(value, 24, "700", "1.2");
      card.add(value);
      (card as any).__value = value;
      return card;
    },

    _buildPatientListPanel(): any {
      const panel = new qx.ui.groupbox.GroupBox();
      panel.setLayout(new qx.ui.layout.VBox(8));
      panel.add(this._createSectionHeader("Patient Records"));

      this.__searchField = new qx.ui.form.TextField();
      this.__searchField.setPlaceholder("Search by patient name or contact number...");
      this.__searchField.addListener("input", () => {
        this.__searchQuery = String(this.__searchField.getValue() || "").toLowerCase().trim();
        this._refreshView();
      });

      this.__tableModel = new qx.ui.table.model.Simple();
      this.__tableModel.setColumns(["Name", "Age", "Sex", "Contact", "Address", "Last Visit"]);
      const table = new qx.ui.table.Table(this.__tableModel);
      table.setStatusBarVisible(false);

      panel.add(this.__searchField);
      panel.add(table, { flex: 1 });
      return panel;
    },

    _buildPatientFormPanel(): any {
      const panel = new qx.ui.groupbox.GroupBox();
      panel.setLayout(new qx.ui.layout.VBox(8));
      panel.add(this._createSectionHeader("New Patient"));

      this.__nameField = new qx.ui.form.TextField();
      this.__nameField.setPlaceholder("Full name *");

      this.__ageField = new qx.ui.form.Spinner(0, 25, 120);
      this.__ageField.setMinimum(0);
      this.__ageField.setMaximum(120);

      this.__sexSelect = new qx.ui.form.SelectBox();
      ["Male", "Female", "Other"].forEach((item) => {
        this.__sexSelect.add(new qx.ui.form.ListItem(item));
      });
      this.__sexSelect.setSelection([this.__sexSelect.getSelectables()[0]]);

      this.__contactField = new qx.ui.form.TextField();
      this.__contactField.setPlaceholder("Contact number");

      this.__addressField = new qx.ui.form.TextArea();
      this.__addressField.setPlaceholder("Address");
      this.__addressField.setHeight(80);

      this.__lastVisitField = new qx.ui.form.DateField();

      const submitBtn = new qx.ui.form.Button("Create Patient");
      submitBtn.addListener("execute", () => this._handleCreatePatient());

      this.__statusLabel = new qx.ui.basic.Label("Ready");

      panel.add(this._createFieldLabel("Full Name"));
      panel.add(this.__nameField);
      panel.add(this._createFieldLabel("Age"));
      panel.add(this.__ageField);
      panel.add(this._createFieldLabel("Sex"));
      panel.add(this.__sexSelect);
      panel.add(this._createFieldLabel("Contact"));
      panel.add(this.__contactField);
      panel.add(this._createFieldLabel("Address"));
      panel.add(this.__addressField);
      panel.add(this._createFieldLabel("Last Visit Date"));
      panel.add(this.__lastVisitField);
      panel.add(submitBtn);
      panel.add(this.__statusLabel);
      return panel;
    },

    _handleCreatePatient(): void {
      const name = String(this.__nameField.getValue() || "").trim();
      const age = Number(this.__ageField.getValue() || 0);
      const sexItem = this.__sexSelect.getSelection()[0] as any;
      const sex = sexItem ? String(sexItem.getLabel()) : "";
      const contact = String(this.__contactField.getValue() || "").trim();
      const address = String(this.__addressField.getValue() || "").trim();
      const lastVisitDate = this.__lastVisitField.getValue();

      if (!name || age <= 0 || !sex) {
        this.__statusLabel.setValue("Name, age, and sex are required.");
        return;
      }

      const lastVisit = lastVisitDate
        ? new Date(lastVisitDate.getTime()).toISOString().slice(0, 10)
        : "";

      this.__patients.unshift({
        id: Date.now().toString(),
        name,
        age,
        sex,
        contact,
        address,
        lastVisit
      });
      this.__sessionAdded += 1;

      this.__nameField.setValue("");
      this.__ageField.setValue(25);
      this.__sexSelect.setSelection([this.__sexSelect.getSelectables()[0]]);
      this.__contactField.setValue("");
      this.__addressField.setValue("");
      this.__lastVisitField.setValue(null);
      this.__statusLabel.setValue("Patient record created.");

      this._refreshView();
    },

    _filterPatients(query: string): any[] {
      const q = query.toLowerCase();
      return this.__patients.filter((p: any) => {
        return p.name.toLowerCase().includes(q) || String(p.contact || "").toLowerCase().includes(q);
      });
    },

    _computeStats(): { total: number; session: number; today: number } {
      const today = new Date().toISOString().slice(0, 10);
      let todayVisits = 0;
      this.__patients.forEach((p: any) => {
        if (p.lastVisit && p.lastVisit === today) {
          todayVisits += 1;
        }
      });
      return {
        total: this.__patients.length,
        session: this.__sessionAdded,
        today: todayVisits
      };
    },

    _refreshView(): void {
      const filtered = this.__searchQuery ? this._filterPatients(this.__searchQuery) : this.__patients;
      const rows = filtered.map((p: any) => [p.name, String(p.age), p.sex, p.contact, p.address, p.lastVisit]);
      this.__tableModel.setData(rows);

      const stats = this._computeStats();
      this.__kpiTotal.__value.setValue(String(stats.total));
      this.__kpiSession.__value.setValue(String(stats.session));
      this.__kpiToday.__value.setValue(String(stats.today));
    },

    _createSectionHeader(text: string): any {
      const header = new qx.ui.basic.Label(text);
      header.setFont("bold");
      this._styleText(header, 15, "700", "1.35");
      header.setMarginBottom(2);
      return header;
    },

    _createFieldLabel(text: string): any {
      const label = new qx.ui.basic.Label(text);
      this._styleText(label, 13, "600", "1.35");
      return label;
    },

    _styleText(label: any, sizePx: number, weight: string, lineHeight: string, opacity?: string): void {
      label.addListenerOnce("appear", () => {
        const dom = label.getContentElement?.().getDomElement?.();
        if (!dom) return;
        dom.style.fontSize = `${sizePx}px`;
        dom.style.fontWeight = weight;
        dom.style.lineHeight = lineHeight;
        dom.style.letterSpacing = "0.01em";
        dom.style.paddingTop = "1px";
        dom.style.paddingBottom = "1px";
        dom.style.whiteSpace = "normal";
        dom.style.overflow = "visible";
        dom.style.textOverflow = "clip";
        dom.style.maxWidth = "none";
        dom.style.width = "auto";

        const innerNodes = dom.querySelectorAll("span, label, div");
        innerNodes.forEach((node: any) => {
          node.style.whiteSpace = "normal";
          node.style.overflow = "visible";
          node.style.textOverflow = "clip";
          node.style.maxWidth = "none";
          node.style.width = "auto";
          node.style.display = "block";
        });
        if (opacity) {
          dom.style.opacity = opacity;
        }
      });
    },

    _applyThemeRoot(): void {
      document.body.style.backgroundColor = "var(--background)";
      document.body.style.color = "var(--foreground)";
    }
  }
});

