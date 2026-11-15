import type { NgpDateAdapter } from 'ng-primitives/date-time';

/**
 * Converts a generic date `T` into a local-time native `Date` via `NgpDateAdapter<T>` so it can be
 * formatted with `Intl.DateTimeFormat`.
 */
export const normalizeToDate = <T>(date: T, adapter: NgpDateAdapter<T>): Date =>
  new Date(
    adapter.getYear(date),
    adapter.getMonth(date),
    adapter.getDate(date),
    adapter.getHours(date),
    adapter.getMinutes(date),
    adapter.getSeconds(date),
    adapter.getMilliseconds(date)
  );
