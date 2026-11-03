# Pagination: A Strip Component plus a Composable Bar

One entry point, `@dragone/ui/pagination`, exposes two Components over `ng-primitives/pagination`:

- **`Pagination`** (`<drgn-pagination>`): the page strip — previous/next around the numbered pages,
  with an ellipsis wherever a run of pages is skipped. It composes `NgpPagination` through
  `hostDirectives` and renders `NgpPaginationButton` / `NgpPaginationPrevious` / `NgpPaginationNext`;
  page state, boundary disabling, `aria-current` and keyboard handling come from the Primitive
  (ADR-0001). The host is the `navigation` landmark.
- **`PaginationComplex`** (`<drgn-pagination-complex>`): the full bar — an optional "items per page"
  select with its range summary, an optional page jumper with the page count, and the strip. Every
  piece is opt-in through a boolean input, so the bar composes down to the strip alone, or to
  range + nav as in the second Penpot variant. The bar is not itself a landmark; the strip inside
  it is.

`totalItems` and `pageSize` are the source of truth for the complex bar: `pageCount`, the range and
the page jumper options all derive from them, so consumers never keep a page count in sync by hand.
Both are documented as separate Storybook sections, `Dragone/UI/Pagination/Simple` and
`Dragone/UI/Pagination/Complex`.

## Considered Options

- **Two Components in one entry point (chosen)**: The bar and the strip read as different units in
  the design (one is a bar of controls, the other a strip of page buttons) and the strip is reusable
  on its own. The bar composes the strip, so the pagination markup exists once.
- **One Component with a `type: 'simple' | 'complex'` input**: A discriminator would have to imply
  which pieces are visible, and consumers wanting one piece from the other group would have to
  override the preset. The booleans would still be needed underneath, so the input would be sugar
  over a mode that does not exist in the markup.
- **One Component whose "simple" form is the complex one with every optional piece off**: No
  discriminator, but the "simple" pagination would then be documented as a configuration of the
  complex one, and the transparent strip (which composes anywhere) would carry the bar's surface.
- **A slot / template API for the pieces**: Consumers could place the pieces freely, but every
  consumer would re-implement the layout, the range arithmetic and the page-size wiring the bar
  exists to provide.

## Consequences

- The strip is composed, not duplicated: `PaginationComplex` renders `<drgn-pagination>`, which owns
  the ng-primitives page state. The bar holds no pagination state of its own — `page` and `pageSize`
  are models it passes down and mirrors back, and an effect pulls `page` back when a smaller
  `pageSize` or `totalItems` shrinks the page count under it.
- `Pagination` carries `showPages` / `showNav` so it can act as the bar's strip; the simple
  pagination is that strip with both on.
- The page window is a **fixed-size** strip: `siblingCount * 2 + 3` cells, always — the first page,
  the last page, an ellipsis on each side where a run is skipped, and a window of page numbers in
  between. A constant cell count is what keeps the strip from changing width as the user navigates:
  the first implementation let the window grow, so the strip went from 5 to 9 cells and widened by
  ~170px between page 1 and page 5, and the leading ellipsis only appeared at page 5. The window is
  **centred on the current page**, and where a side needs no ellipsis it spends that cell on one more
  page number. The window is not covered by the Primitive and lives in `src/utils/page-window.ts`,
  with its own unit tests plus component tests asserting the cell count is constant, the leading
  ellipsis starting at page 3, and the page before the current one staying clickable. Each cell
  carries a stable `key` (`page-3`, `ellipsis-before`, `ellipsis-after`) and the strip tracks by it:
  when the window slides, the surviving page buttons are moved rather than destroyed, so keyboard
  focus stays on the button the user just activated. Tracking by `$index` would drop focus to
  `<body>` when the window shrinks (WCAG 2.4.3), and that regression is covered too.
- Window fix, reported from the UI: the window used to **open** on the current page, so page 3
  rendered `1 … 3 4 5 … 10` and the page before the current one — the one a user reaches for to step
  back — was never on screen; the previous button was the only way back. The window is now centred on
  the current page: page 3 renders `1 … 2 3 4 … 10`, page 4 `1 … 3 4 5 … 10`, pages 8 to 10
  `1 … 6 7 8 9 10`, with the cell count untouched. Among the windows that fill the budget the
  shortest one wins, which is how the leading ellipsis keeps starting at page 3; a window that leaves
  the current page a neighbour on each side beats one that does not, which is what keeps page 2 on
  its wider window instead of retreating to a symmetric-but-lonely one.
- Accepted consequence of that shape, taken deliberately over the alternative: at page 3 the leading
  ellipsis sits between pages 1 and 2 and hides nothing, where `1 2 3 4 5 … 10` would carry the same
  information without it. Keeping the gap was the point of the fix — the strip is a constant shape
  and the earlier requirement was the leading ellipsis from page 3 on — and the other reading is the
  `start > 1` test in `windowCells`. Page 2 still has no leading ellipsis, because its window reaches
  page 1.
- Limit of the narrowest budget: `siblingCount="1"` gives 5 cells, which mid-strip can hold only one
  page number, so there the current page has no neighbour to click and stepping back is the previous
  button again. The default (`2`, 7 cells) always keeps the page before the current one, whatever the
  page count. Raising the default so the narrow budget also keeps a neighbour was rejected: it would
  widen the strip past the 7 cells the Penpot sheet fixes.
- Consequence of the fixed size: the Penpot sheet draws page 1 alone as `1 2 3 … 10` (5 cells). A
  5-cell strip can only show one page number between the two ellipses, so the spare cell is spent on
  a wider window instead and page 1 renders `1 2 3 4 5 … 10`. The mock is a single static state; a
  strip that keeps its width cannot also show three page numbers at the ends and three in the
  middle.
- `page` — and the bar's `pageSize` — must be **two-way** bound. The Primitive's page state is a
  controlled signal, so a one-way `[page]` binding pins the strip: it emits `pageChange` but never
  moves. The Components' JSDoc, the Storybook arg descriptions and the stories (`[(page)]="page"`,
  the same shape the DatePicker and Dialog stories use) all say so, and a spec covers the two-way
  path so a regression in the binding contract is caught.
- Pagination is navigation, not a Field Control, so neither Component implements
  `FormValueControl` (ADR-0004): they expose `[(page)]` and `[(pageSize)]` instead of a `value`
  model, matching the `checked` / `checkedChange` shape the Switch Component already uses.
- The page-size and page-jumper selects reuse the `Select` Component from `@dragone/ui/select`
  rather than a second dropdown. The Pagination spec draws an 82px select, so the bar narrows the
  Select through a scoped class: the parent's `.select[_ngcontent]` (specificity 0-2-0) outranks the
  Select's `:host` rule (0-1-0) without reaching into the Select's internals.
- Tokens: `--drgn-pagination-*` in `src/components.css`, each mapped to the Primitive Token it
  stands for (ADR-0003). The white card that frames the simple strip's states in the Penpot sheet is
  the surface the states are drawn on, not part of the Component: `Pagination` stays transparent so
  it composes anywhere, and only the complex bar carries the light-blue surface.
- Faithfulness note: the complex bar's page strip overflows its 1016px board in the Penpot file, so
  the numbered pages are clipped there. They are implemented because the exported artwork contains
  them, behind the bar's own `showPages` (default `true`, passed straight down to the strip). The
  bar's template used to hardcode that off while the class had no such input, so the numbers never
  rendered, the story and spec bindings had nothing to bind to, and a component test asserting the
  numbered page buttons are disabled with the bar could not pass.
- Follow-up, recorded rather than escalated (a library gap, not a Sirio design defect, so ADR-0005
  does not apply): `Select.ariaLabelledBy` has no effect. The Select's host binds
  `[attr.aria-labelledby]` from that input, but the attribute never reaches the DOM, so the
  page-size select takes its accessible name from `ariaLabel` — set to the same text as its visible
  label, so the two cannot drift apart. This deserves its own fix in the `select` entry point.
- Tile states, per the design's state sheet: hover fills `#00368F`, press and the current page fill
  `#00173D`, disabled is `#E3E5E8`, and the focus state is the spec's 1px `#0065D1` interactive
  border plus its 3px glow. The current page being the darkest shade is what makes the spec's focus
  border work on it (3.18:1, WCAG 1.4.11) — the earlier reading, with the current page at `#00368F`,
  needed a light-ring workaround that is now gone.
- Accessibility decisions worth keeping (WCAG 2.2 AA), all inside Dragone CSS or templates — no
  public API impact:
  - The disabled **current** page restates the disabled text colour. The selected rule and
    `button:disabled` would otherwise leave the `color` to the more specific selected one, and the
    page number renders white on the disabled fill: 1.26:1 (WCAG 1.4.3).
  - The focus ring is drawn with `box-shadow`, not the `filter: drop-shadow()` the Penpot export
    emits. `filter` traces the element's alpha shape, so on a transparent tile it would glow around
    the digits alone rather than around the tile; `box-shadow` follows the border box, which is the
    tile the spec draws. The 1px border is always present and transparent, so focusing a tile cannot
    resize it.
  - Remaining **Sirio escalation candidate** (ADR-0005): a tile that is hovered _and_ keyboard
    focused shows the `#0065D1` border on the `#00368F` hover fill, 1.97:1. It needs a mouse hovering
    a keyboard-focused tile, and `ngpFocusVisible` keeps mouse clicks out of `data-focus-visible`.
  - `<ul role="list">` keeps the list semantics WebKit drops for `list-style: none`; the ellipsis is
    `aria-hidden`; the range summary is a `role="status"` live region so a page change announces the
    new range; a `@media (forced-colors: active)` marker keeps the current page identifiable when
    the author fill is replaced.
  - The complex bar wraps (`flex-wrap: wrap`), so it reflows at 320 CSS px instead of forcing
    horizontal scrolling (WCAG 1.4.10); the strip itself is ~290px wide at the default
    `siblingCount`.
  - Recorded as follow-ups, not fixed here: the "di 10 Pagine" paragraph is not tied to the page
    jumper (the Select exposes no `aria-describedby`), and `Pagination` still exposes a named but
    empty `navigation` landmark if a consumer turns both `showPages` and `showNav` off (the role
    comes from the Primitive and would have to be overridden).
  - Other Sirio token pairings flagged for escalation, none of them a WCAG failure on their own:
    the divider `#84A9E6` on the bar surface is 1.86:1 (decorative, `aria-hidden`), and the focus
    glow's `#007DB3` at 70% has no Primitive Token at all — it is the same untokenized value the
    Button focus shadow hardcodes, so it is recorded here as a Component Token.
