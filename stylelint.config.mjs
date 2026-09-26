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
  },
};
