# AGENTS.md — `@dragone/ui`

Component-authoring rules. Repository-wide rules are in the root
[`AGENTS.md`](../../../AGENTS.md); the end-to-end procedure is the
[component-authoring skill](../../../.agents/skills/dragone-component-authoring/SKILL.md).

## Entry points

Each Component is a secondary entry point under `projects/dragone/ui/<name>/`:

```
<name>/
├── ng-package.json     # { "lib": { "entryFile": "public-api.ts" } }
├── public-api.ts       # export * from './src/<name>'
├── index.ts            # export { <Name> } from './public-api'
└── src/
    ├── <name>.ts
    ├── <name>.css
    ├── <name>.spec.ts
    └── <name>.stories.ts
```

`button/` is the canonical reference. Composite Components keep additional
Children/Private Components in `src/<child>/`, as `accordion/`, `breadcrumb/`, and `radio/`
do. `utils/` and `temporal-adapter/` are entry points without stories: they are not visual
Components. Never create a barrel export from the root `public-api.ts`; its placeholder
(`export const TEST = 'test'`) is intentional (ADR-0002) and must not be removed.

## Authoring rules

- Primitive first: consult the ng-primitives MCP (`ngp-mcp` in `opencode.jsonc`, or
  `.vscode/mcp.json`), compose the Primitive via `hostDirectives`, and read its state with
  `inject*State()`. If ng-primitives does not cover something, implement it locally, prefer
  upstreaming it, and leave a note saying why.
- Selector (`angular.json` prefix `drgn`): attribute selector on the native element when the
  Component needs no template; element selector otherwise. Both alias forms exist today —
  `button[drgnButton],button[drgn-button]` and `input[drgnInputText],input[drgn-input-text]` —
  and `@angular-eslint/component-selector` prefers kebab-case (warn). Do not copy the legacy
  `input[date-picker]` selector used by `InputDatePicker`.
- `angular.json` generates components with `changeDetection: OnPush`, but current components
  do not declare `changeDetection`. Do not mass-migrate it without an ADR.
- Standalone only, no NgModules (lint enforces). Use signal `input()` / `output()` /
  `model()`; no decorator `@Input()`/`@Output()` (not lint-enforced yet, check manually).
- API naming: `semantic` for visual style (Button: `primary`, `secondary`, `tertiary`,
  `ghost`); `status` via the `drgnStatus` directive input for semantic meaning (`info`,
  `success`, `warning`, `danger`, `neutral`). Do not reintroduce `variant` as an input name.
- Styling: only `--drgn-*` tokens from `src/components.css`; no new color literals. Legacy
  color literals exist (e.g. in `breadcrumb-item.css`, `calendar.css`, and drop-shadow
  filters) — fix only in scope or record them, do not mass-rewrite. Prefer spacing/size tokens
  where they exist; raw px for one-off geometry is tolerated but reviewed. Typography
  utilities come from `src/typography.css`. Expose state to CSS with `host` `[attr.data-*]`
  bindings.
- Forms (ADR-0004): implement `FormValueControl` / `FormCheckboxControl` from
  `@angular/forms/signals`; a ng-primitives hostDirective `ModelSignal` may satisfy the
  contract. Never `ControlValueAccessor`.
- Cross-entry-point imports use the `@dragone/ui/<name>` path alias (see
  `file-upload/src/file-upload.ts`), not relative paths across entry points.
- Runtime `--drgn-*` aliases of inline `--ngp-*` values belong on the element that carries
  them (ADR-0003), never on `:root`.
- Dev-only logging: guard with `ngDevMode` and use `provideLogger` / `Logger` (see
  `button/src/button.ts`).

## Tests and stories

- Render with `render()` from `@wismaz/vitest-browser-angular`. Use a Test Host when the
  Component targets a native element selector or a test must drive it from a parent context
  (see `button/src/button.spec.ts`); otherwise render the Component directly.
- Timers: use `setUpFastForward()` / `setUpManualForward()` from
  `tests/setup-timer-mode.ts` and follow the "Controlling Time in Tests" rules in `CONTEXT.md`.
- `test-setup.ts` forces `prefers-reduced-motion: reduce`; do not re-enable animations in
  tests.
- There is no e2e runner: interaction coverage lives in `play` functions.
- Every visual Component has `<name>.stories.ts` with `tags: ['autodocs']` and title
  `Dragone/UI/<Name>`. Add `play` functions for the interactive behavior you touch. Preview
  with `pnpm storybook`; verify with `pnpm build-storybook`.

## Component validation

Generic steps:
[`docs/references/validate-implementation.md`](../../../docs/references/validate-implementation.md).

1. `pnpm build @dragone/ui`
2. Stories or Storybook config changed: `pnpm build-storybook`
3. Public API changed: `pnpm change --bump <type> --summary "<text>" @dragone/ui`, then
   `pnpm lint:package` (rebuilds and runs publint)
