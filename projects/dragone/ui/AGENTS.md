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

- Primitive first: consult the ng-primitives MCP (`ngp-mcp`, declared in `.mcp.json`,
  `opencode.jsonc` and `.vscode/mcp.json`), compose the Primitive via `hostDirectives`,
  and read its state with `inject*State()`. If ng-primitives does not cover something,
  implement it locally, prefer upstreaming it, and leave a one-line note saying why (no
  ADR citations, no decision narrative).
- `/** JSDoc */` is strictly for **API consumers** (IDE hover and Storybook `autodocs`, enforced
  by the `dragone/concise-jsdoc` oxlint plugin):
  - **Scope**: exported public API symbols only (and exported stories). Never put `/** JSDoc */`
    on `private` / `protected` / `#private` members, non-exported helpers, or `.spec.ts` files.
  - **Budget**: 1–2 prose lines on class/interface members (`input()`, `output()`, `model()`,
    methods, properties) plus `@default` when not inferred; up to 4 prose lines on top-level
    exported classes/functions/types (excluding fenced code examples and `@tag` lines). Match
    `button/src/button.ts`.
  - **Content**: state the observable contract (_what_ it is and _how to use_ it). Keep
    implementation rationale (_why_ a binding, DOM node, or algorithm was chosen) and `ADR-*`
    citations out of JSDoc — put decision history in `docs/adr/` or a brief `//` comment on the
    line that needs it.
- `//` line comments are for **maintainers**, used sparingly only where the code cannot speak for
  itself: a browser/SSR quirk, an a11y spec constraint, or a one-line note on why behavior is
  implemented locally instead of via `ng-primitives`. Default to zero `//` comments when the code
  is self-explanatory.
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
  bindings. Host-state selectors must be flat (`:host[data-*]`, never nested as
  `:host { &[data-*] { ... } }`) — since Angular 22.2 nested selectors under `:host`
  are scoped with `_ngcontent` and silently stop matching (ADR-0008). Nesting under
  element/class selectors is fine (enforced by the `dragone/no-host-nesting`
  stylelint plugin).
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
  (see `button/src/button.spec.ts`); otherwise render the Component directly. For directives,
  prefer `renderDirective()` from the same package — generated host plus reactive `hostProps`
  instead of a hand-written Test Host (see `loader/src/busy/busy.spec.ts`).
- Query with the specialized locators only (`getByRole`, `getByTestId`, `getByText`, …).
  Never `locator.locator(<selector>)`: in `@vitest/browser` v5 it is `protected` on the
  `Locator` type (TS2551) even though it resolves at runtime, so it breaks `tsc` and the IDE.
  Add `drgnTestId` (`TestId` from `@dragone/ui/utils`, which renders `data-testid` in
  `ngDevMode` only) to template internals you must reach instead (see `alert/src/alert.ts`
  and `alert.spec.ts`).
- Timers: use `setUpFastForward()` / `setUpManualForward()` from
  `tests/setup-timer-mode.ts` and follow the "Controlling Time in Tests" rules in `CONTEXT.md`.
- `test-setup.ts` forces `prefers-reduced-motion: reduce`; do not re-enable animations in
  tests.
- There is no e2e runner: interaction coverage lives in `play` functions.
- Every visual Component has `<name>.stories.ts` with `tags: ['autodocs']`. Title: `Dragone/UI/<Name>`
  when the entry point documents a single unit; when it exposes several units that read better apart
  (e.g. a component and the service over the same skeleton), nest them as `Dragone/UI/<Name>/<Unit>`
  — `Dragone/UI/Dialog/Component` and `Dragone/UI/Dialog/Service`. Add `play` functions for the
  interactive behavior you touch. Preview with `pnpm storybook`; verify with `pnpm build-storybook`.

## Component validation

Generic steps:
[`docs/references/validate-implementation.md`](../../../docs/references/validate-implementation.md).

1. `pnpm build @dragone/ui`
2. Stories or Storybook config changed: `pnpm build-storybook`
3. Public API changed: mark it with a Conventional Commit (`feat!:` / `fix!:` / a
   `BREAKING CHANGE:` footer), then `pnpm lint:package` (rebuilds and runs publint). Versioning
   and the changelog are handled by release-please, not by hand — see
   [`docs/references/release.md`](../../../docs/references/release.md).
