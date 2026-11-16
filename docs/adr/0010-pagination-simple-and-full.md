# Pagination: A Simple Strip plus a Full Bar

One entry point, `@dragone/ui/pagination`, exposes two Components over `ng-primitives/pagination`:

- **`PaginationSimple`** (`<drgn-pagination-simple>`): the page strip — previous/next around the
  numbered pages, with an ellipsis wherever a run of pages is skipped. It composes `NgpPagination`
  through `hostDirectives` and renders `NgpPaginationButton` / `NgpPaginationPrevious` /
  `NgpPaginationNext`; page state, boundary disabling, `aria-current` and keyboard handling come
  from the Primitive (ADR-0001). The host is the `navigation` landmark.
- **`PaginationFull`** (`<drgn-pagination-full>`): the full bar — an optional "items per page"
  select with its range summary, an optional page jumper with the page count, and the previous/next
  cursor tile at the right edge. Every piece is opt-in through a boolean input, so the bar composes
  down to range + nav (the design's mobile form) or to the nav alone. The bar is not itself a
  landmark; the strip inside it is.

Each Component lives in its own directory under `src/` — `src/simple/simple.ts` and
`src/full/full.ts` (template in `full.html`, styles in `full.css`) — and its class carries only the
variant, `Simple` and `Full`, so the class never repeats the entry point. `public-api.ts` gives them
the readable names consumers import:

```ts
export { Full as PaginationFull } from './src/full/full';
export { Simple as PaginationSimple } from './src/simple/simple';
```

`totalItems` and `pageSize` are the source of truth for the full bar: `pageCount`, the range and
the page jumper options all derive from them, so consumers never keep a page count in sync by hand.
The two Components are documented as separate Storybook sections, `Dragone/UI/Pagination/Simple` and
`Dragone/UI/Pagination/Full`.

## Considered Options

- **Two Components in one entry point (chosen)**: The bar and the strip read as different units in
  the design (one is a bar of controls, the other a strip of page buttons) and the strip is reusable
  on its own. The bar composes the strip, so the pagination markup exists once.
- **One Component with a `type: 'simple' | 'full'` input**: A discriminator would have to imply
  which pieces are visible, and consumers wanting one piece from the other group would have to
  override the preset. The booleans would still be needed underneath, so the input would be sugar
  over a mode that does not exist in the markup.
- **One Component whose "simple" form is the full one with every optional piece off**: No
  discriminator, but the "simple" pagination would then be documented as a configuration of the
  full one, and the transparent strip (which composes anywhere) would carry the bar's surface.
- **A slot / template API for the pieces**: Consumers could place the pieces freely, but every
  consumer would re-implement the layout, the range arithmetic and the page-size wiring the bar
  exists to provide.

## Consequences

- The strip is composed, not duplicated: the bar renders `<drgn-pagination-simple>`, which owns
  the ng-primitives page state. The bar holds no pagination state of its own — `page` and `pageSize`
  are models it passes down and mirrors back, and an effect pulls `page` back when a smaller
  `pageSize` or `totalItems` shrinks the page count under it.
- `PaginationSimple` carries `showPages` / `showNav` so it can act as the bar's strip; the standalone
  pagination is that strip with both on. The bar passes `showPages="false"`: its strip is the
  previous/next cursor only. `siblingCount` and `pageLabel` therefore stay on `PaginationSimple` and are
  not inputs of the bar — they would configure page buttons the bar never renders.
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
  stands for (ADR-0003). The white card that frames the strip's states in the design sheet is the
  surface the states are drawn on, not part of the Component: `PaginationSimple` stays transparent so it
  composes anywhere, and only the full bar carries the light-blue surface.
- Bar layout, from the Figma "Pagination Items + Page" master (1016×74, `#D9E4F7`, radius 4). The
  board has no padding of its own; it is 74px tall (`min-block-size`, so a taller consumer Select
  grows it instead of clipping) — which is what makes the rule 58px at the sections' 8px padding —
  and holds three regions, each with its own padding:
  - "items per page" — 8px/16px padding, 8px between the label+select tile and the range, 16px
    between the label and its select. It is the region that **grows**, so the pager and the cursor
    tile keep to the right edge at any width. The master leaves it exactly the space the other two
    do not use (625px of 1016).
  - page jumper — 8px/24px/8px/32px padding, a leading rule and 24px between the rule, the select and
    the page count.
  - cursor tile — white (`--drgn-pagination-nav-surface`), flush with the right edge, 2×38px wide.
- The bar carries **one** rule, the one before the page jumper. The master's "items per page" group
  also contains a rule vector between its select tile and the range, but that vector has no stroke
  assigned — it is not drawn — so copying it would add a divider the design does not have.
- The bar's cursor tile is rounded on its right corners rather than clipped by the bar
  (`overflow: clip` in the master). A clip would shave the spec's 3px focus glow off the next
  button, which sits flush against that edge; the 1px focus border stays inside the tile, so this
  is about drawing the whole focus state, not about meeting the focus-indicator requirement.
- The strip's Component Token is overridden to `0` inside the tile (buttons touching, as the master
  draws them) instead of reaching into the strip's CSS. The override is scoped to the child element
  the bar renders — `.nav drgn-pagination-simple` — and a spec pins the resulting 76px tile, because
  the token inherits from that element: when the strip was renamed the selector kept the old tag and
  the two cursor buttons sprang 4px apart, for an 80px tile. The range and page count stay **inline
  text**: their `&nbsp;` separators are the spaces a screen reader reads, and a flex `gap` would
  render each `&nbsp;` as an anonymous flex item on top of the gap. `span + span` adds the 4px the
  space does not measure, to reach the master's 8px word gap.
- Faithfulness note, re-baselined on the Figma file: the bar renders **no numbered pages**. The
  master's `Show Page Number` boolean toggles the page-jumper region, not the numbers, and its strip
  is the previous/next cursor ("Cursor + Number" is a separate master, the standalone
  `PaginationSimple`).
  The earlier Penpot export clipped the numbers inside the bar's board, which is why they used to be
  implemented behind a bar-level `showPages`; that input (and the `siblingCount` / `pageLabel` that
  only fed it) is gone, and a spec asserts the bar has no `Pagina <n>` buttons.
- Naming, settled over two passes. The bar started as `PaginationComplex`
  (`<drgn-pagination-complex>`, `pagination-complex/`); "complex" described a difficulty, so it
  became `full`, the word the design uses for the complete variant. The entry point now holds
  `src/simple/` and `src/full/`, each file named after its variant, each class carrying only that
  variant (`Simple`, `Full`), and the public API exporting the readable names (`PaginationSimple`,
  `PaginationFull`): the class does not repeat the context the entry point already supplies, and the
  export does not leave a bare `Full` in a consumer's imports. The strip was renamed with it —
  `Pagination` to `Simple`, `<drgn-pagination>` to `<drgn-pagination-simple>` — so the two
  Components read as the design's two variants, matching the Storybook sections
  `Dragone/UI/Pagination/Simple` and `Dragone/UI/Pagination/Full`.
- Follow-ups, recorded rather than escalated (library gaps, not Sirio design defects): `Select`
  exposes its disabled state as `data-disabled` plus `tabindex="-1"`, with no `aria-disabled` on the
  `combobox`, so a screen reader user hears no "dimmed" state on the bar's selects when the bar is
  disabled (WCAG 4.1.2) — the Pagination specs assert the attribute instead, which keeps the gap
  visible from here. `Select.ariaLabelledBy` also has no effect: the Select's host binds
  `[attr.aria-labelledby]` from that input, but the attribute never reaches the DOM, so the
  page-size select takes its accessible name from `ariaLabel` — set to the same text as its visible
  label, so the two cannot drift apart. Both deserve their own fix in the `select` entry point.
- Follow-up in the same entry point, visible here as a mismatch: the Select renders **58px** tall
  (a 24px line box in `1rem` of padding, plus its 1px border) where its own Sirio master is a 48px
  field with a 16px line box. The bar absorbs the difference — it is still 74px, and the rules still
  58px — but the selects sit 8px from its edges where the spec leaves 13px. Fixing it changes every
  Select consumer's layout, so it belongs to the `select` entry point, not to this one.
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
  - The bar **never wraps**, here or inside its sections: the pagination cursor is its last region
    and must stay on its line. It used to wrap (`flex-wrap` on the bar and on the sections), which
    dropped the cursor tile under the controls as soon as the three regions did not fit — at 850px
    the bar grew to 118px with the tile on a second line. The bar now keeps its own `min-content`
    width, so on a viewport narrower than that the page scrolls instead of the tile sliding out of
    the bar's surface. Consequence, accepted: the bar does not meet WCAG 1.4.10 on a 320px
    viewport — for narrow layouts the composition exists in the API (`showPageSize` /
    `showPageJumper` off, the design's mobile form) and is the consumer's call. The bar's strip is
    the two cursor buttons, 80px wide at the strip's 4px gap — the master draws them touching, and
    the tile's Component Token override gets them to 76px.
  - Recorded as follow-ups, not fixed here: the "di 10 Pagine" paragraph is not tied to the page
    jumper (the Select exposes no `aria-describedby`); `PaginationSimple` still exposes a named but empty
    `navigation` landmark if a consumer turns both `showPages` and `showNav` off (the role comes from
    the Primitive and would have to be overridden); and the strip draws one 4px gap between all of
    its cells where the "Cursor + Number" master uses 6px between two page tiles and 4px around the
    cursor. Two pixels do not justify splitting the strip's list into a nested group.
  - Other Sirio token pairings flagged for escalation, none of them a WCAG failure on their own:
    the divider `#84A9E6` on the bar surface is 1.86:1 (decorative, `aria-hidden`), and the focus
    glow's `#007DB3` at 70% has no Primitive Token at all — it is the same untokenized value the
    Button focus shadow hardcodes, so it is recorded here as a Component Token.
