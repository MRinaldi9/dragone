import type { NgpDateAdapter } from 'ng-primitives/date-time';

/**
 * Set the year of a date, clamping the day-of-month to the target February when the source date
 * falls on February 29 and the target year is not a leap year.
 *
 * The intermediate steps never materialize an invalid date (they go through `day: 1`), so this is
 * safe with both the native `Date` adapter (which would roll over to March 1) and the Temporal
 * adapter (which would throw a `RangeError`).
 */
export function setYearClamped<T>(adapter: NgpDateAdapter<T>, date: T, year: number): T {
  const firstOfTargetMonth = adapter.set(date, { year, day: 1 });
  const daysInTargetMonth = adapter.getDate(adapter.endOfMonth(firstOfTargetMonth));
  const day = Math.min(adapter.getDate(date), daysInTargetMonth);
  return adapter.set(date, { year, day });
}

/**
 * Set the month of a date, clamping the day-of-month to the target month's length when the source
 * day falls beyond it (e.g. January 31 → February 28/29).
 *
 * Same safety property as `setYearClamped`: the intermediate step goes through `day: 1`, so no
 * invalid date is ever materialized.
 */
export function setMonthClamped<T>(adapter: NgpDateAdapter<T>, date: T, month: number): T {
  const firstOfTargetMonth = adapter.set(date, { month, day: 1 });
  const daysInTargetMonth = adapter.getDate(adapter.endOfMonth(firstOfTargetMonth));
  const day = Math.min(adapter.getDate(date), daysInTargetMonth);
  return adapter.set(date, { month, day });
}

/** Whether `date` falls within the `min`/`max` bounds (unbounded when absent). */
function inBounds<T>(adapter: NgpDateAdapter<T>, date: T, bounds?: { min?: T; max?: T }): boolean {
  return (
    (!bounds?.min || !adapter.isBefore(date, bounds.min)) &&
    (!bounds?.max || !adapter.isAfter(date, bounds.max))
  );
}

/**
 * Find the nearest date to `date` that is not disabled, searching outward in both directions so the
 * result is the closest enabled day (e.g. a disabled Saturday resolves to Friday, not Monday).
 *
 * The search respects the `min`/`max` bounds and never returns a date outside them. When no enabled
 * date exists within the bounds — or the search window is exhausted — the original `date` is
 * returned unchanged.
 */
export function findNearestEnabledDate<T>(
  adapter: NgpDateAdapter<T>,
  date: T,
  isDisabled: (date: T) => boolean,
  bounds?: { min?: T; max?: T },
): T {
  if (!isDisabled(date)) {
    return date;
  }
  // Safety net for the unbounded case (no min/max): stop searching after a century of days.
  const maxOffset = 366 * 100;
  for (let offset = 1; offset <= maxOffset; offset += 1) {
    const previous = adapter.subtract(date, { days: offset });
    const next = adapter.add(date, { days: offset });
    if (inBounds(adapter, previous, bounds) && !isDisabled(previous)) {
      return previous;
    }
    if (inBounds(adapter, next, bounds) && !isDisabled(next)) {
      return next;
    }
    if (!inBounds(adapter, previous, bounds) && !inBounds(adapter, next, bounds)) {
      return date;
    }
  }
  return date;
}
