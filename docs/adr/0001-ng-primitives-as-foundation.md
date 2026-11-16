# ng-primitives as Foundation

Dragone is built on [ng-primitives](https://angularprimitives.com) as the sole provider of behavior and accessibility. Every interactive Component wraps one or more ng-primitives directives via `hostDirectives`, remapping their inputs/outputs to `drgn-*` names and adding visual design (CSS, typography, tokens). Dragone never re-implements interaction logic, keyboard navigation, or ARIA semantics that ng-primitives already provides.

## Considered Options

- **ng-primitives (chosen)**: Headless Angular directives with full WAI-ARIA compliance, signal-based state, and a broad primitive catalog (~48). Dragone adds styling and API design on top.
- **Build from scratch**: Implement all behavior, keyboard navigation, and ARIA directly. Full control but enormous maintenance cost and high a11y risk.
- **Another headless library (e.g. Angular CDK, Material)**: CDK provides some primitives but is not headless-directive-based; Material couples styling with behavior and does not align with Sirio's design language.

## Consequences

- Dragone's component scope is bounded by ng-primitives' catalog — if a needed primitive does not exist in ng-primitives, it must be built in ng-primitives first, not in Dragone.
- ng-primitives upgrades may introduce breaking changes that propagate to Dragone. The peer dependency range (`>= 0.115.0`) absorbs patch/minor updates; major API shifts require coordinated migration.
- Internal ng-primitives state (e.g. `injectSelectState()`, `injectCheckboxState()`) is an implementation detail of Dragone components and is never exposed to consumers.
