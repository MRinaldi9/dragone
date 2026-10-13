# Dialog: Declarative Component plus a Dynamic Service

One entry point, `@dragone/ui/dialog`, exposes two distinct units over one shared skeleton, built on `ng-primitives/dialog` (`NgpDialogManager`, `NgpDialogOverlay`, `NgpDialog`, `NgpDialogTitle`, `NgpDialogDescription`):

- **`Dialog`** (component, `<drgn-dialog>`): declarative — content in markup, opening driven by a two-way `[(open)]` binding.
- **`DynamicDialog`** (service): programmatic — `DynamicDialog.open(BodyComponent, config)` creates the body component at runtime and returns a `DynamicDialogRef`.

Both render the same private `DialogPanel` skeleton (scrim, panel, status icon, title, description, close action) and are portaled by `NgpDialogManager`, which owns focus trap, escape routing, scrim clicks, scroll blocking, `aria-hidden` bookkeeping and exit animations — nothing is re-implemented (ADR-0001). They are documented as two Storybook sections: `Dragone/UI/Dialog/Component` and `Dragone/UI/Dialog/Service`.

## Considered Options

- **One entry point, two units (chosen)**: The skeleton is private and shared, so both units stay in the same secondary entry point and differ only in their public surface and docs. Keeps one source of truth for markup and styles.
- **Two entry points (`@dragone/ui/dialog` + `@dragone/ui/dialog-service`)**: Rejected: cross-entry-point imports resolve only through public exports (AGENTS rule), so the shared panel would have to be either published (it injects `NgpDialogRef`; not a consumer API) or duplicated (two skeletons — what this ADR exists to prevent). A third "internals" entry point would invent a pattern the repo does not have.
- **Service-only (earlier step)**: One call site for dialogs, typed results and reactive input bindings, but no way to author a dialog in markup — every dialog needed a body component class and an imperative call.
- **Declarative-only**: Markup-native, but dynamic bodies would force every consumer to wire portals, templates and injectors themselves.
- **Re-export the upstream `NgpDialogManager` / `NgpDialogTrigger`**: Zero Dragone code, but no Sirio styling, no typed result contract, and the public API would leak upstream internals (root `public-api.ts` stays a placeholder per ADR-0002 anyway).

## Consequences

- `DialogPanel` is a **Private Component** shared by both units: its selector, inputs and the service's context token are internal. Public surface: `Dialog`, `DynamicDialog`, `DynamicDialogConfig`, `DynamicDialogRef`, `injectDynamicDialogRef`, `DialogSize`, `DialogRole`. The dynamic unit carries the `Dynamic` prefix throughout, so no name reads as configuration for the component.
- The declarative component cannot be opened by the manager as a _component_ (the manager's `ComponentPortal` accepts no projectable nodes), so it portals its own `<ng-template>` containing the panel and its `<ng-content>`. Angular resolves that projection because the embedded view keeps a reference to its declaration view — verified with a probe (both descendant and ancestor view containers) before committing to the design.
- The declarative component closes its dialog on destroy: the portaled dialog lives outside the component's view and would otherwise outlive its owner (e.g. a route change while the dialog is open).
- `DynamicDialog.open()` and `injectDynamicDialogRef()` hand out the same memoized handle per dialog. `DynamicDialogRef` is an interface backed by a private implementation — the upstream `NgpDialogRef` never appears in the public types.
- `DynamicDialogConfig.inputs` and `.outputs` are the reactive seam for dynamic bodies: they compile to declarative `inputBinding`/`outputBinding` bindings at `createComponent` time, so the body uses plain signal inputs and outputs like in a template — the framework owns propagation, no manual `setInput`/subscription bookkeeping.
- No CDK-style `data` bag: with declarative input bindings available, a payload token would duplicate the seam with weaker typing. The body declares its payload as typed inputs (`inputs: { articleId: signal(42) }`), and `DynamicDialogRef`/`DynamicDialogConfig` carry no data generic — the only generic left is the close result.
- The declarative component exposes `title`, `description`, `size`, `status`, `closeButtonLabel`, `modal` and `open`; escape/outside-click/container come from the global `provideDialogConfig` (the manager's trigger path offers no per-dialog switch for them either).
- `modal: false` renders no scrim (transparent, `pointer-events: none`) and `aria-modal="false"`; the page stays pointer-interactive. Two upstream limitations in `NgpDialog`/`NgpDialogManager` remain and cannot be worked around through the public API; they are recorded here rather than escalated because they are library gaps, not Sirio design defects (ADR-0005):
  - **Focus stays trapped even when non-modal.** `NgpDialog` always applies `NgpFocusTrap` and does not derive it from `modal`: the trap arms unconditionally, and its `disabled` input only skips the initial focus and is not exposed. Keyboard users therefore cannot leave a "non-modal" dialog. Fixing it requires an upstream change to derive/expose the focus trap from `modal`.
  - **Page scroll is blocked while any dialog is open,** including non-modal ones. Fixing it requires scroll blocking to become modal-aware upstream.
- Faithfulness notes recorded with the tokens (`src/components.css`): several Penpot variants carry an untokenized `#aab2bb/50%` shadow (token-linked elevations are used), the warning/danger icons are swapped versus Alert (circle-exclamation / triangle-exclamation per the dialog design), and `success` has no dialog variant in the design (Alert's icon is used).
