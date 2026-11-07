/** @type {import("stylelint").Config} */
export default {
  cache: true,
  extends: ["stylelint-config-standard"],
  ignoreFiles: ["node_modules", "projects/dragone/ui/src/tokens.css"],
  plugins: ["./scripts/stylelint-plugins/dragone-no-host-nesting.mjs"],
  referenceFiles: [
    {
      files: [
        "projects/dragone/ui/src/tokens.css",
        "projects/dragone/ui/src/components.css",
        "projects/dragone/ui/src/typography.css",
      ],
    },
  ],
  rules: {
    "dragone/no-host-nesting": true,
    // `selector-no-unmatchable` flags `:host[attr]` compounds as never matching the shadow
    // host. That is true for native Shadow DOM, where only `:host([attr])` matches — but our
    // components use Angular's default emulated view encapsulation, which rewrites
    // `:host[attr]` to `[_nghost-…][attr]` at build time, so these selectors do match.
    // Re-enable this rule only if components move to ViewEncapsulation.ShadowDom or ship
    // CSS that skips Angular's style shim.
    "selector-no-unmatchable": null,
  },
};
