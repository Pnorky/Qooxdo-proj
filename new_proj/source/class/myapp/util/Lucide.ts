// @ts-nocheck
/* ************************************************************************
   Copyright: 2026
************************************************************************ */

/**
 * Inline SVG wrappers that reference {@link myapp.util.LucideRegistry} sprite via &lt;use&gt;.
 * Stroke uses currentColor for theme tokens on ancestors.
 */
qx.Class.define("myapp.util.Lucide", {
  type: "static",

  statics: {
    __spriteUri: null,

    _escapeAttr(value: string): string {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    },

    _getSpriteUri(): string {
      if (!myapp.util.Lucide.__spriteUri) {
        myapp.util.Lucide.__spriteUri = qx.util.ResourceManager.getInstance().toUri(
          myapp.util.LucideRegistry.SPRITE_RESOURCE_ID
        );
      }
      return myapp.util.Lucide.__spriteUri;
    },

    _hasSymbol(key: string): boolean {
      const ids = myapp.util.LucideRegistry.SYMBOL_IDS;
      for (let i = 0; i < ids.length; i++) {
        if (ids[i] === key) return true;
      }
      return false;
    },

    /**
     * Returns SVG markup referencing the shared sprite (no embedded path data in JS).
     * @param name Kebab-case symbol id (e.g. "menu", "log-out", "layout-grid")
     * @param options.size Pixel width/height (default 18)
     * @param options.className Extra class names on the root &lt;svg&gt;
     * @param options.ariaHidden If false, omit aria-hidden (for meaningful icons)
     */
    svgHtml(
      name: string,
      options?: {
        size?: number;
        className?: string;
        ariaHidden?: boolean;
      }
    ): string {
      const key = String(name || "")
        .toLowerCase()
        .trim()
        .replace(/_/g, "-");
      if (!myapp.util.Lucide._hasSymbol(key)) {
        return "";
      }

      const size =
        options && options.size != null && !isNaN(Number(options.size))
          ? Number(options.size)
          : 18;

      const classes = ["lucide-inline"];
      if (options && options.className) {
        classes.push(String(options.className));
      }
      const cls = myapp.util.Lucide._escapeAttr(classes.join(" "));
      const aria =
        options && options.ariaHidden === false
          ? ""
          : ' aria-hidden="true" focusable="false"';

      const rawUri = myapp.util.Lucide._getSpriteUri();
      const uri = myapp.util.Lucide._escapeAttr(rawUri);
      const frag = myapp.util.Lucide._escapeAttr(key);

      return (
        `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="${cls}"` +
        ` width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"` +
        aria +
        `><use href="${uri}#${frag}" xlink:href="${uri}#${frag}" /></svg>`
      );
    }
  }
});
