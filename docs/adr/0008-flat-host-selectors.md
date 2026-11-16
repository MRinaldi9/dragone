# Flat `:host` Selectors: No Nesting Under `:host` / `:host-context`

Since Angular 22.2 (compiler change "Scope nested CSS rules"), selectors nested under `:host` (or `:host-context`) are scoped with the content attribute (`_ngcontent`) that the host element never carries. A rule like `:host { &[data-hidden] { display: none; } }` compiles to `[_nghost][data-hidden][_ngcontent]` inside the host rule, which never matches — so host-state styles (hidden, disabled, checked, sizes, semantics, themes) silently stop applying at runtime. Dragone therefore writes host-state selectors flat (`:host[data-hidden]`, `:host[data-size='large'][data-icon-only]`, `:host-context([data-theme='dark'])[data-semantic='tertiary']`). Nesting is still allowed under element or class selectors (e.g. `[ngpSelectOption] { &[data-selected] { ... } }`), where the content scope is correct.

## Considered Options

- **Flat `:host` selectors (chosen)**: Same compiled output (`[_nghost][...]`) in every Angular version, before and after 22.2. The transformation from nested to flat is mechanical and specificity-preserving: `&:hover` inside `&[data-x]` becomes the identical compound `:host[data-x]:hover`.
- **Keep nesting, pin Angular < 22.2**: Avoids the rewrite but freezes the framework upgrade path and leaves the test suite red on Vitest 5 + Angular 22.2. Not viable.
- **Keep nesting, wait for an upstream Angular fix**: The 22.2 scoping may be intentional (native CSS nesting passthrough). Even if reverted upstream, flat selectors compile identically everywhere, so there is nothing to gain by waiting.
- **Disable view encapsulation (`ViewEncapsulation.None`)**: Would sidestep scoping entirely but leaks component styles globally, breaking the style isolation every Component relies on.

## Consequences

- Component CSS convention (see `projects/dragone/ui/AGENTS.md`): no `&`-nesting with root `:host` / `:host-context` / `:host(...)`. Each rewritten file carries a `/* Flat :host selectors per ADR-0008 ... */` pointer so future authors don't re-nest. The rule is enforced by the `dragone/no-host-nesting` stylelint plugin (`scripts/stylelint-plugins/`).
- Existing flat `:host[...]` rules (e.g. `radio-item`, `select`, `tooltip` animations, `:host-context` in `button`) were already correct and are the reference pattern.
- No public API, Token, or template changes: this is a stylesheet-only migration with identical intended cascade and specificity.
