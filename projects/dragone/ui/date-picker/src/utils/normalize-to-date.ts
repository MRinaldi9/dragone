import type { NgpDateAdapter } from 'ng-primitives/date-time';

/**
 * Convert a generic date `T` into a native `Date` that `Intl.DateTimeFormat` can format.
 *
 * `Intl.DateTimeFormat.format()` only accepts `Date | number | Temporal.*`, so a generic date type
 * (e.g. `Temporal.PlainDateTime`, a luxon `DateTime`, or a custom model) cannot be passed to it
 * directly. This helper decomposes `T` into its calendar components through the `NgpDateAdapter<T>`
 * getters — the single source of truth for reading a date — and rebuilds a native `Date` from
 * them.
 *
 * The resulting `Date` is a **local-time** date, matching the default behaviour of
 * `Intl.DateTimeFormat` (which formats in local time), so formatting round-trips consistently
 * regardless of the underlying `T`.
 *
 * @param date The generic date to convert.
 * @param adapter The `NgpDateAdapter<T>` used to read the date's components.
 * @returns A native `Date` representing the same calendar date/time as `date`.
 */
export const normalizeToDate = <T>(date: T, adapter: NgpDateAdapter<T>): Date =>
  new Date(
    adapter.getYear(date),
    adapter.getMonth(date),
    adapter.getDate(date),
    adapter.getHours(date),
    adapter.getMinutes(date),
    adapter.getSeconds(date),
    adapter.getMilliseconds(date),
  );
