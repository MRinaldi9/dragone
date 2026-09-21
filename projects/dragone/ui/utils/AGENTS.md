# AGENTS.md — utils

Entry point `@dragone/ui/utils`. Root rules: [`AGENTS.md`](../../../../AGENTS.md); library rules:
[`projects/dragone/ui/AGENTS.md`](../AGENTS.md).

## Public surface

Everything exported through `public-api.ts`: event plugins (`provideEventsPlugin`, debounce and
prevent-default plugins), type utilities (`toValue`, `toElement`, `notifier`, `sleep`, guards),
accessibility (`Announcer`, `ANNOUNCEMENT_DELAY`), theming (`Theme`, `Status`, `Layout` and
their factories/injectors), and `Logger` / `provideLogger`.

## State factory pattern

Directives and stateful utilities use `createPrimitive('Name', factory)` from
`ng-primitives/state`, which returns `[, factory, injectState, provideState]`:

- provide the state on the owning directive with `provideXState({ inherit: false })`;
- expose it through `injectXState()`, never as a raw mutable object;
- keep the state read-only (signals), and map it to host `[attr.data-*]` in the directive.

## Theming directives

- `Theme` (`[drgnTheme]`): `light` / `dark`; resolves the parent theme when not set and renders
  `data-theme`.
- `Status` (`[drgnStatus]`, alias of `status`): `info` / `success` / `warning` / `danger` /
  `neutral`; `neutral` is the default and is not rendered as `data-status`.
- `Layout` (`[drgnLayout]`): `desktop` / `mobile`; renders `data-layout`.

## Announcer

`Announcer` (`[drgnAnnouncer]`) wraps the CDK `LiveAnnouncer`: `announce`,
`announceSequence` (default 500 ms between messages, overridable with
`provideAnnouncementDelay`), and `clear`. Newer calls cancel in-flight sequences, and
sequences stop on destroy.

## Tests

6 spec files (announcer, event plugins, logger, layout, status, theme). This entry point has no
stories because it is not a visual Component. Focus:
`CI=true pnpm exec vitest run utils`.
