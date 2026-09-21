# AGENTS.md — date-picker

Entry point `@dragone/ui/date-picker`. Root rules:
[`AGENTS.md`](../../../../AGENTS.md); library rules:
rules: [`projects/dragone/ui/AGENTS.md`](../AGENTS.md).

## Public surface

- `DatePicker` (`drgn-date-picker`) composes `NgpDatePicker` + popover and provides
  `provideDatePickerDragoneState({ inherit: false })`.
- `Calendar` (`drgn-calendar`), `PeriodSelect` (`drgn-calendar-period-select`), and
  `InputDatePicker` — the latter uses the legacy directive selector `input[date-picker]` (no
  `drgn` prefix; do not copy it for new Components).
- `provideDragoneDatePickerConfig` / `injectDragoneDatePickerConfig`: `firstDayOfWeek`
  (default `1`), `locale` (default `it-IT`), `options` (default
  `{ day: '2-digit', month: '2-digit', year: 'numeric' }`), and an optional `adapter`.

## Date adapter

- The default is the ng-primitives native `Date` adapter. `TemporalAdapter` is opt-in: pass
  `adapter: TemporalAdapter` to the config, or register it with `provideDateAdapter`.
- Native Temporal is required — Chrome/Edge 133+, Firefox 137+, Safari 18.4+. No polyfill is
  bundled.
- The adapter contract uses zero-based months (`NgpDateUnits.month`, 0-11) to round-trip with
  `getMonth`; `TemporalAdapter` converts to/from Temporal's 1-based month. Preserve this when
  adding adapters.

## State and parsing

- `datePickerDragoneStateFactory` extends `NgpDatePickerState` with `format`, `parseDate`,
  `keepInvalid`, `dayAbbrs`, `monthsLocale`, `locale`, `showToday`, and
  `setResolveFocusedDate`; read it with `injectDatePickerDragoneState()`.
- Input parsing goes through `parseLocaleDateString` + `normalizeToDate`. `InputDatePicker`
  debounces with `injectInputDebounceTimer` and only pushes parsed values back to the model;
  use the timer helpers from `tests/setup-timer-mode.ts` when testing it.

## Tests

6 spec files cover the date picker, calendar, input, period select, and the date utils. Focus:
`CI=true pnpm exec vitest run date-picker`.
