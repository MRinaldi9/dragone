# Dragone engineering guide

Dragone is an Angular workspace for building a UI library based on the Sirio Design System.
The implementation lives under `projects/dragone/ui`.

## Where to look

- This file is always loaded: keep it to invariants and pointers.
- [`projects/dragone/ui/AGENTS.md`](projects/dragone/ui/AGENTS.md): component-authoring rules,
  auto-loaded when working under that path.
- `.agents/skills/`: step-by-step procedures, loaded on demand — `angular-developer`,
  `accessibility`,
  [`dragone-component-authoring`](.agents/skills/dragone-component-authoring/SKILL.md), and
  [`dragone-release`](.agents/skills/dragone-release/SKILL.md).
- `docs/references/`: lookup material, read on demand via the triggers below.

## Repository

- Angular 22 design system, one publishable package: `@dragone/ui` in `projects/dragone/ui`.
  It ships as secondary entry points (`@dragone/ui/button`, ...).
- `CONTEXT.md` is the canonical glossary; `docs/adr/` records architectural decisions. Read
  both before changing behavior, public API, tokens, forms, or accessibility policy.
- Package manager: `pnpm` >= 12 and Node >= 24.15.0, enforced by `devEngines` in
  `package.json`. Never run `npm` or `yarn`.
- Generated files — do not edit: `pnpm-lock.yaml`, `documentation.json`, `dist/**`,
  `coverage/**`, `out-tsc/**`, `.angular/**`, `storybook-static/**`, `**/__screenshots__/**`,
  `.husky/_/**` (stale hook shims), and the release-please block of
  `projects/dragone/ui/CHANGELOG.md`.

## Commands

Read [`docs/references/scripts.md`](docs/references/scripts.md) before running project commands.

## Required validation

Read [`docs/references/validate-implementation.md`](docs/references/validate-implementation.md)
before validating the implementation.

## Architecture invariants

- ng-primitives owns the behavior it provides (ADR-0001): compose Primitive directives via
  `hostDirectives` and read their state with `inject*State()`. Behavior ng-primitives does not
  cover may be implemented locally, but prefer upstreaming it and leave a note saying why.
- Secondary entry points only (ADR-0002): each component directory owns `ng-package.json`,
  `public-api.ts`, and `index.ts`. Consumers import subpaths; never re-export from the root
  `public-api.ts`.
- Tokens (ADR-0003): components consume only `--drgn-*` tokens from
  `projects/dragone/ui/src/components.css`; no new color literals in component CSS.
- Forms (ADR-0004): `FormValueControl` / `FormCheckboxControl` from `@angular/forms/signals`;
  never `ControlValueAccessor`, never both.
- Docs are English (`CONTEXT.md`). Update `CONTEXT.md` when domain terms change and add an ADR
  for architectural decisions.
- Accessibility: WCAG 2.2 AA. Sirio design defects are implemented faithfully, recorded, and
  escalated — never patched by editing Primitive Tokens or specs (ADR-0005).

## Security and supply chain

- No authentication, authorization, network, or persistence code exists here. Do not add any.
- Do not expose ng-primitives internal state through public APIs.
- Adding an `allowBuilds` entry in `pnpm-workspace.yaml` runs a dependency's build scripts; it
  requires explicit review. Do not hand-edit `pnpm-lock.yaml` or bypass `minimumReleaseAge` /
  `minimumReleaseAgeStrict`.
- Keep secrets and telemetry out of the repo, tests, and stories.
- Publishing packs the build output in `dist/dragone/ui`, never the source. Releases are cut by
  release-please; read [`docs/references/release.md`](docs/references/release.md) before
  releasing or touching the release automation.

## Git and release

Read [`docs/references/git-release.md`](docs/references/git-release.md) before committing.
Read [`docs/references/release.md`](docs/references/release.md) before a release or any change to
the release automation (ADR-0007).

## Completion report

Report: (1) outcome, (2) files changed, (3) exact commands run and their results, (4) public
API / ADR / `CONTEXT.md` impact or "none", (5) residual risks or follow-ups.
