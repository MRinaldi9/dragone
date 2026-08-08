# Two-Tier Token System: Primitive Token → Component Token

Dragone uses a two-tier CSS custom property architecture. **Primitive Tokens** (`tokens.css`) are the original Sirio design-system variables (e.g. `--color-global-primary-100`, `--color-alias-interactive-primary-default`). **Component Tokens** (`components.css`) are the canonical `--drgn-*` variables that Components consume (e.g. `--drgn-color-interactive-primary-default`). Components never reference Primitive Tokens directly — they consume only `--drgn-*` tokens.

## Considered Options

- **Two tiers: Primitive → Component (chosen)**: Indirection layer. Components depend only on `--drgn-*` names. Swapping the base palette or adopting a different design system is possible by remapping `--drgn-*` to different Primitive Tokens, without touching component CSS.
- **Single tier (components consume raw tokens directly)**: Simpler, fewer files. But couples every component to Sirio's naming scheme and makes palette swaps require editing every component's CSS.
- **Three+ tiers (raw → alias → component)**: Additional semantic aliasing between raw and component layers. More indirection than needed — the current alias/specific tokens inside `tokens.css` already serve this purpose without a separate tier.

## Consequences

- **Consumer customization**: Component Tokens (`--drgn-*`) are the public customization API. Consumers override `--drgn-*` values to diverge from Sirio's visual language without touching Sirio's raw variables.
- **Primitive Tokens are Sirio-owned**: Consumers must not override `--color-global-*` or `--color-alias-*` variables — these are synced from Sirio and overrides would be lost on the next token update.
- Adding a new component token requires adding it to `components.css` mapped to the appropriate Primitive Token, then consuming it in component CSS.
- Runtime tokens (e.g. `--drgn-runtime-select-width: var(--ngp-select-width)`) bridge ng-primitives dynamic CSS custom properties into the `--drgn-*` namespace and live in `components.css` alongside static Component Tokens.
