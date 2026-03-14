/* ************************************************************************

   Copyright: 2026

   License: MIT license

   Authors:

************************************************************************ */
/**
 * Basecoat-style tooltip helper.
 * Uses Basecoat attribute API on target elements:
 * - data-tooltip="..."
 * - data-side="top|bottom|left|right"
 * - data-align="start|center|end"
 *
 * Supports shared-tooltip usage by attaching one instance to multiple widgets.
 */
qx.Class.define("qooxdo_proj.components.ui.ToolTip", {
    extend: qx.core.Object,
    properties: {
        /** Tooltip text shown by Basecoat */
        text: {
            check: "String",
            init: "",
            apply: "_applyTooltipProps",
            event: "changeText"
        },
        /** Tooltip side (top, bottom, left, right) */
        side: {
            check: ["top", "bottom", "left", "right"],
            init: "top",
            apply: "_applyTooltipProps",
            event: "changeSide"
        },
        /** Tooltip alignment (start, center, end) */
        align: {
            check: ["start", "center", "end"],
            init: "center",
            apply: "_applyTooltipProps",
            event: "changeAlign"
        },
        /** Enable/disable tooltip output on targets */
        enabled: {
            check: "Boolean",
            init: true,
            apply: "_applyTooltipProps",
            event: "changeEnabled"
        }
    },
    construct(text = "", side = "top", align = "center") {
        this.base(arguments);
        this.__targets = [];
        this.setText(String(text || ""));
        this.setSide(side || "top");
        this.setAlign(align || "center");
    },
    members: {
        __targets: null,
        __getTargetDom(widget) {
            if (!widget || widget.isDisposed())
                return null;
            const contentEl = widget.getContentElement ? widget.getContentElement() : null;
            const dom = contentEl ? contentEl.getDomElement() : null;
            if (!dom)
                return null;
            // Prefer interactive descendants when present (e.g., ui.Button wraps an inner <button>).
            return dom.querySelector("button, input, textarea, select, [role='button']") || dom;
        },
        __applyToWidget(widget) {
            const dom = this.__getTargetDom(widget);
            if (!dom)
                return;
            if (!this.getEnabled() || !this.getText()) {
                dom.removeAttribute("data-tooltip");
                dom.removeAttribute("data-side");
                dom.removeAttribute("data-align");
                return;
            }
            dom.setAttribute("data-tooltip", this.getText());
            dom.setAttribute("data-side", this.getSide());
            dom.setAttribute("data-align", this.getAlign());
        },
        _applyTooltipProps() {
            this.__targets.forEach(entry => {
                if (!entry.widget || entry.widget.isDisposed())
                    return;
                this.__applyToWidget(entry.widget);
            });
        },
        /**
         * Attach this tooltip to a widget.
         * Multiple widgets may share the same tooltip instance.
         * @param {qx.ui.core.Widget} widget
         */
        attachTo(widget) {
            if (!widget || widget.isDisposed())
                return;
            const existing = this.__targets.find(entry => entry.widget === widget);
            if (existing) {
                this.__applyToWidget(widget);
                return;
            }
            const entry = {
                widget,
                appearId: null
            };
            entry.appearId = widget.addListener("appear", () => {
                this.__applyToWidget(widget);
            }, this);
            this.__targets.push(entry);
            this.__applyToWidget(widget);
        },
        /**
         * Detach this tooltip from a widget.
         * @param {qx.ui.core.Widget} widget
         */
        detachFrom(widget) {
            const index = this.__targets.findIndex(entry => entry.widget === widget);
            if (index < 0)
                return;
            const entry = this.__targets[index];
            if (entry.appearId != null && widget && !widget.isDisposed() && widget.removeListenerById) {
                widget.removeListenerById(entry.appearId);
            }
            const dom = this.__getTargetDom(widget);
            if (dom) {
                dom.removeAttribute("data-tooltip");
                dom.removeAttribute("data-side");
                dom.removeAttribute("data-align");
            }
            this.__targets.splice(index, 1);
        },
        /**
         * Detach from all currently attached widgets.
         */
        detachAll() {
            const copy = this.__targets.slice();
            copy.forEach(entry => this.detachFrom(entry.widget));
        },
        /**
         * Get currently attached widgets.
         * @return {qx.ui.core.Widget[]}
         */
        getTargets() {
            return this.__targets.map(entry => entry.widget);
        }
    },
    destruct() {
        this.detachAll();
        this.__targets = null;
    }
});
