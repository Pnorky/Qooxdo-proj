/* ************************************************************************
   Copyright: 2026
************************************************************************ */
qx.Class.define("qooxdo_proj.util.Theme", {
    type: "static",
    statics: {
        applyBackground(widget, variant = "background") {
            const colorVar = `var(--${variant})`;
            const applyStyle = () => {
                const contentElement = widget.getContentElement ? widget.getContentElement() : null;
                const element = contentElement ? contentElement.getDomElement() : null;
                if (element) {
                    element.style.backgroundColor = colorVar;
                }
            };
            if (widget.isVisible && widget.isVisible()) {
                applyStyle();
            }
            else if (widget.addListenerOnce) {
                widget.addListenerOnce("appear", applyStyle, widget);
            }
        },
        applyForeground(widget, variant = "foreground") {
            const colorVar = `var(--${variant})`;
            const applyStyle = () => {
                const contentElement = widget.getContentElement ? widget.getContentElement() : null;
                const element = contentElement ? contentElement.getDomElement() : null;
                if (element) {
                    element.style.color = colorVar;
                }
            };
            if (widget.isVisible && widget.isVisible()) {
                applyStyle();
            }
            else if (widget.addListenerOnce) {
                widget.addListenerOnce("appear", applyStyle, widget);
            }
        },
        applyBorder(widget) {
            const colorVar = "var(--border)";
            try {
                widget.setDecorator(new qx.ui.decoration.Decorator().set({
                    width: 1,
                    color: colorVar
                }));
            }
            catch (_e) {
                widget.addListenerOnce("appear", () => {
                    const domElement = widget.getContentElement ? widget.getContentElement() : null;
                    const element = domElement ? domElement.getDomElement() : null;
                    if (element) {
                        element.style.borderColor = colorVar;
                        element.style.borderWidth = "1px";
                        element.style.borderStyle = "solid";
                    }
                }, this);
            }
        },
        getCSSVariable(propertyName) {
            return `var(--${propertyName})`;
        }
    }
});
