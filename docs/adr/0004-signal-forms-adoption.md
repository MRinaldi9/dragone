# Signal Forms Adoption — FormValueControl / FormCheckboxControl

Dragone Form Controls integrate with Angular via Signal Forms (`@angular/forms/signals`), not `ControlValueAccessor`. Components implement `FormValueControl<T>` or `FormCheckboxControl` — the contracts for custom controls in Signal Forms. The `ControlValueAccessor` interface is not used.

The interface may be satisfied directly by the Dragone Component or by its ng-primitives hostDirective. When a ng-primitives hostDirective already exposes a `ModelSignal` (e.g. `NgpSelect` exposes `value` as a model), the Dragone Component can rely on the hostDirective to satisfy the `FormValueControl` contract without declaring its own `model()`. This is not obvious from the Angular documentation but is confirmed by Angular's test suite.

## Considered Options

- **Signal Forms (chosen)**: `FormValueControl`/`FormCheckboxControl` with `ModelSignal`. Aligns with Angular's modern signal-based forms, no `NgZone` dependency, type-safe, composable with signal validators.
- **ControlValueAccessor (legacy)**: The traditional bridge for custom form controls. Works with both Reactive Forms and template-driven forms, but is imperative, not signal-based, and requires `provideValueAccessor()` boilerplate.
- **Both**: Not supported. Angular explicitly warns against implementing both `ControlValueAccessor` and `FormValueControl`/`FormCheckboxControl` on the same component.

## Consequences

- `ChipSelected` must migrate from `ControlValueAccessor` (via `provideValueAccessor`) to `FormCheckboxControl` with `checked: ModelSignal<boolean>`.
- Form Controls implement both `touch` (output, emitted on blur) and `touched` (input, receives touched state from the form for UI reflection) per the `FormUiControl` interface.
- Existing `input()` + `output()` patterns can remain when the ng-primitives hostDirective satisfies the `ModelSignal` requirement — not every component needs to be rewritten with `model()`.
- Signal Forms controls are compatible with Reactive Forms via `compatForm`, so consumers using `FormGroup`/`FormControl` are not blocked.
