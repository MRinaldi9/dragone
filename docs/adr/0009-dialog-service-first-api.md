# Dialog: Service-First API with a Private Shell

`@dragone/ui/dialog` exposes dialogs through a service, not markup: `Dialog.open(component, config)` renders a consumer-provided Dialog Body Component inside a private skeleton (the Dialog Shell) built on `ng-primitives/dialog` (`NgpDialogManager`, `NgpDialogOverlay`, `NgpDialog`, `NgpDialogTitle`, `NgpDialogDescription`). A declarative API (trigger directive + `ng-content` children) is planned as a second entry layer reusing the same shell, so both APIs stay visually identical.

## Considered Options

- **Service-first with a private shell (chosen)**: One `Dialog.open()` call from anywhere opens a Sirio-styled dialog whose body is a dynamically created component. The body injects `injectDialogRef()` to close itself with a typed result, and `config.inputs` (values or signals, applied via `setInput` in an `effect`) keep it reactive while the dialog is open. The manager owns focus trap, escape routing, scrim clicks, scroll blocking, `aria-hidden` of the background, and exit animations — nothing is re-implemented (ADR-0001).
- **Declarative-first (trigger + `ng-content`)**: Mirrors the ng-primitives example directly, but composites every skeleton piece in consumer templates and gives no programmatic path; dynamic bodies would require every consumer to wire portals themselves.
- **Re-export the upstream `NgpDialogManager`**: Zero Dragone code, but no Sirio styling, no typed result contract, and the public API would leak upstream internals (root `public-api.ts` stays a placeholder per ADR-0002 anyway).

## Consequences

- The Dialog Shell is a Private Component: its selector and context token are internal; consumers only see `Dialog`, `DialogRef`, `DialogConfig`, and `injectDialogRef`. `DialogRef` is an interface backed by a private implementation — the upstream `NgpDialogRef` never appears in the public types — and `open()`/`injectDialogRef()` hand out the same memoized handle per dialog.
- `DialogConfig.inputs` and `DialogConfig.outputs` are the reactive seam: they compile to declarative `inputBinding`/`outputBinding` bindings at `createComponent` time, so the Dialog Body Component uses plain signal inputs and outputs like in a template — the framework owns propagation, no manual `setInput`/subscription bookkeeping.
- No CDK-style `data` bag: with declarative input bindings available, a payload token would duplicate the seam with weaker typing. The body declares its payload as typed inputs (`inputs: { articleId: signal(42) }`), and `DialogRef`/`DialogConfig` carry no data generic — the only generic left is the close result.
- `modal: false` renders no scrim (transparent, `pointer-events: none`) and `aria-modal="false"`; the page stays pointer-interactive. Two upstream limitations in `NgpDialog`/`NgpDialogManager` remain and cannot be worked around through the public API; they are recorded here rather than escalated because they are library gaps, not Sirio design defects (ADR-0005):
  - **Focus stays trapped even when non-modal.** `NgpDialog` always applies `NgpFocusTrap` and does not derive it from `modal`: the trap arms unconditionally, and its `disabled` input only skips the initial focus and is not exposed. Keyboard users therefore cannot leave a "non-modal" dialog. Fixing it requires an upstream change to derive/expose the focus trap from `modal`.
  - **Page scroll is blocked while any dialog is open,** including non-modal ones. Fixing it requires scroll blocking to become modal-aware upstream.
- Faithfulness notes recorded with the tokens (`src/components.css`): several Penpot variants carry an untokenized `#aab2bb/50%` shadow (token-linked elevations are used), the warning/danger icons are swapped versus Alert (circle-exclamation / triangle-exclamation per the dialog design), and `success` has no dialog variant in the design (Alert's icon is used).
- The declarative layer (Children Components + trigger) must reuse the Dialog Shell rather than duplicate it.
