---
name: dragone-component-authoring
description: Step-by-step procedure to add or change a Component in @dragone/ui (secondary entry point, ng-primitives composition, tokens, tests, stories, validation). Use when creating, refactoring, or reviewing a Dragone Component.
---

# Dragone Component Authoring

Preconditions: `pnpm install` done; read `CONTEXT.md` and the ADRs that apply. Repository rules
live in `AGENTS.md` (root) and `projects/dragone/ui/AGENTS.md`; this skill is the procedure.

## Steps

1. **Find the Primitive.** Query the ng-primitives MCP (`ngp-mcp`) for the behavior you need
   (e.g. `NgpSwitch`, `NgpSelect`). If nothing exists, prefer upstreaming it to ng-primitives;
   if you implement locally, leave a comment saying why (ADR-0001).
2. **Choose the selector.** Attribute selector on a native element when the Component needs no
   template (`button[drgnButton]`, `input[drgnInputText]`); element selector otherwise
   (`drgn-select`, `drgn-alert`). Keep both alias forms (`drgnX` and `drgn-x`) consistent with
   existing components; the linter prefers kebab-case.
3. **Scaffold the entry point.** Create
   `projects/dragone/ui/<name>/{ng-package.json,public-api.ts,index.ts,src/}` with
   `<name>.ts/.css/.spec.ts/.stories.ts`. Copy `button/` as reference. Never touch the root
   `public-api.ts` (ADR-0002).
4. **Implement.** Compose the Primitive with `hostDirectives`; read state with `inject*State()`
   and never expose it. Signal `input()`/`output()`/`model()`; OnPush is the schematic default
   but current components do not declare it. Style only with `--drgn-*` tokens from
   `src/components.css` (no new color literals), typography classes from `src/typography.css`,
   state exposed via `host` `[attr.data-*]`. Runtime `--drgn-*` aliases of inline `--ngp-*`
   values stay on the element that carries them (ADR-0003).
5. **Forms.** Implement `FormValueControl`/`FormCheckboxControl` from
   `@angular/forms/signals` when the Component is a control; a hostDirective `ModelSignal` may
   satisfy the contract. Never `ControlValueAccessor` (ADR-0004).
6. **Tests.** Use `render()` from `@wismaz/vitest-browser-angular`; add a Test Host for native
   element selectors or parent-driven tests. Timers: `setUpFastForward()` /
   `setUpManualForward()` from `tests/setup-timer-mode.ts`.
7. **Stories.** Add `<name>.stories.ts` with `tags: ['autodocs']`, title `Dragone/UI/<Name>`,
   and `play` functions for interactive behavior.
8. **Validate.** `pnpm format:check`, `pnpm lint`,
   `CI=true pnpm exec vitest run <area>`, `CI=true pnpm test`, `pnpm build @dragone/ui`;
   add `pnpm build-storybook` if stories changed.
9. **Document.** Update `CONTEXT.md` / add an ADR when behavior or API changes; record a change
   intent for published API changes (`pnpm change --bump <type> --summary "<text>" @dragone/ui`).

## Pitfalls

- Don't copy the legacy `input[date-picker]` selector.
- Don't hardcode a second color literal because a token is missing: add a `--drgn-*` token in
  `components.css` mapped to the Primitive Token instead.
- Don't re-enable animations in tests (`test-setup.ts` forces reduced motion).
