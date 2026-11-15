import type { NgpDateAdapter } from 'ng-primitives/date-time';

/**
 * Sets the year of `date`, clamping February 29 to February 28 when the target year is not a leap
 * year.
 */
// Steps through `day: 1` first so native `Date` never rolls over to March 1 and `Temporal` never throws.
export function setYearClamped<T>(adapter: NgpDateAdapter<T>, date: T, year: number): T {
  const firstOfTargetMonth = adapter.set(date, { year, day: 1 });
  const daysInTargetMonth = adapter.getDate(adapter.endOfMonth(firstOfTargetMonth));
  const day = Math.min(adapter.getDate(date), daysInTargetMonth);
  return adapter.set(date, { year, day });
}

/**
 * Sets the month of `date`, clamping the day-of-month to the target month's length (e.g. Jan 31 →
 * Feb 28/29).
 */
export function setMonthClamped<T>(adapter: NgpDateAdapter<T>, date: T, month: number): T {
  const firstOfTargetMonth = adapter.set(date, { month, day: 1 });
  const daysInTargetMonth = adapter.getDate(adapter.endOfMonth(firstOfTargetMonth));
  const day = Math.min(adapter.getDate(date), daysInTargetMonth);
  return adapter.set(date, { month, day });
}

function inBounds<T>(adapter: NgpDateAdapter<T>, date: T, bounds?: { min?: T; max?: T }): boolean {
  return (
    (!bounds?.min || !adapter.isBefore(date, bounds.min)) &&
    (!bounds?.max || !adapter.isAfter(date, bounds.max))
  );
}

/**
 * Returns the nearest non-disabled date to `date` within `bounds` (searching outward in both
 * directions), or `date` itself if none is found.
 */
export function findNearestEnabledDate<T>(
  adapter: NgpDateAdapter<T>,
  date: T,
  isDisabled: (date: T) => boolean,
  bounds?: { min?: T; max?: T }
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
