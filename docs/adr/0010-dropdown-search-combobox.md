# Dropdown Search Is the Combobox

A `Dropdown` with a `DropdownSearch` had two elements claiming the same popup: the trigger carried
`role="combobox"` (from `NgpSelect`) and the search field drove the list from a `searchbox`, with
`aria-controls` and `aria-activedescendant` but none of the other combobox states. Both exposed
`aria-activedescendant` while the panel was open, and a locally written directive forwarded the
keys the trigger never received.

The search field is now the combobox, composed with `NgpSelectInput` (APG "Combobox with List
Autocomplete") — option 1 of the tracked follow-up (FU-2) — and the private forwarding directive is
deleted. While the field exists,
`NgpSelect` removes the combobox role, `aria-expanded`, `aria-controls` and `aria-activedescendant`
from the trigger, which falls back to its native role; when the panel closes the field is destroyed
and the trigger is the combobox again. The panel stays a non-modal `dialog` wrapping the search row
and the listbox, named from the trigger's label source, with the listbox as the only owner of the
options.

## Considered Options

- **Search field as the combobox (chosen)**: `NgpSelectInput` already implements the model — key
  handling, focus on open, `aria-autocomplete="list"`, `aria-expanded`, `aria-controls`,
  `aria-activedescendant`, `Escape`/`Tab` dismissal — so Dragone stops reimplementing it. The
  trade-offs are the upstream input behavior: `type="text"` (the field was already forced to text
  by `InputText`), `Home`/`End` move the caret instead of the active option, and the trigger's role
  flips with the panel instead of staying constant.
- **Trigger as the combobox with an auxiliary filter**: Keeps one combobox owner for the whole
  lifecycle, but the filter must not carry combobox states, so the key forwarding survives locally
  and the active option needs another channel while the filter has focus (a live region, or no
  focus move into the field at all). More local behavior, and the filter stops announcing the list.
- **Keep the hybrid**: Rejected: two `aria-activedescendant` owners while the panel is open is not
  a model any assistive technology can follow, and the states on the search field were incomplete.

## Consequences

- `DropdownSearch` imports `NgpSelectInput` instead of forwarding keys itself; its public surface
  is unchanged (`placeholder`, `queryChange`). `dropdown-search-focus.ts` is deleted.
- The search field takes focus when the panel opens, drives the options with
  `ArrowUp`/`ArrowDown`/`Enter`, and exposes the active option through `aria-activedescendant`.
  `Home`/`End` stay with the caret; `dropdown.spec.ts` asserts that, so the behavior cannot drift
  silently.
- `Escape` and `Tab` close the panel. `Tab` moves on to the next control instead of being trapped
  in the panel, so `NgpFocusTrap` is no longer applied to the search row and the previous APG
  deviation is gone (former FU-3).
- `DropdownTrigger` keeps the trigger in the tab order while the panel is open. `NgpSelect` sets
  `tabindex="-1"` whenever an `NgpSelectInput` is registered because in its model the input lives
  inside the trigger; here the input is in the portaled panel, and a `-1` trigger makes the
  browser restart sequential navigation from the top of the document after `Tab`. The override runs
  in an `afterRenderEffect` keyed on `open()`/`disabled()`, and mirrors the primitive's disabled
  state.
- Focus restoration on close is local to `DropdownSearch`: the select overlay dismisses `Escape`
  from a document capture listener with `restoreFocus: false`, and the upstream `closeDropdown()`
  only refocuses the trigger when the active element is its registered input. On destroy, the
  search returns focus to the trigger only when focus would otherwise fall to the body, so a `Tab`
  that already moved on is not pulled back.
- The trigger's role now depends on the panel state: `combobox` while closed, native role while
  open. Tests and stories query the trigger by `data-testid` and assert the role explicitly in
  both states; querying `getByRole('combobox')` across the transition would resolve to the search
  field.
- The search field still has no programmatic name beyond its placeholder, which now matters more
  because it is the combobox: tracked as FU-1.
- Upstream candidates: a "filter inside the popup" mode of `NgpSelectInput`, so `DropdownTrigger`
  need not re-assert `tabindex`, and an option to keep `Home`/`End` on the list.
