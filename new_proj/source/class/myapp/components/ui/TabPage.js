/* ************************************************************************

   Copyright: 2026

   License: MIT license

   Authors:

************************************************************************ */
/**
 * Lightweight tab page model for myapp.components.ui.TabView.
 * Holds tab label + panel content and notifies TabView through property events.
 */
qx.Class.define("myapp.components.ui.TabPage", {
    extend: qx.core.Object,
    properties: {
        /** Tab button label */
        label: {
            check: "String",
            init: "",
            event: "changeLabel"
        },
        /** Panel content as string */
        content: {
            check: "String",
            init: "",
            event: "changeContent"
        },
        /** Whether panel content should be treated as HTML */
        richContent: {
            check: "Boolean",
            init: false,
            event: "changeRichContent"
        }
    },
    construct(label = "", content = "", richContent = false) {
        this.base(arguments);
        this.setLabel(String(label || ""));
        this.setContent(String(content || ""));
        this.setRichContent(!!richContent);
    }
});
