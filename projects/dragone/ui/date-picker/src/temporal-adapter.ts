import { Platform } from '@angular/cdk/platform';
import { inject, Injectable } from '@angular/core';
import type { NgpDateAdapter, NgpDateUnits, NgpDuration } from 'ng-primitives/date-time';
/**
 * Date adapter backed by the ECMAScript Temporal API (`Temporal.PlainDateTime`).
 *
 * All operations are **immutable** — every method returns a new
 * `Temporal.PlainDateTime` instance without mutating the original.
 *
 * @usageNotes
 *
 * ### Runtime requirements
 *
 * This adapter requires a JavaScript runtime that supports the
 * [Temporal proposal](https://tc39.es/proposal-temporal/docs/) natively:
 *
 * - Chrome 133+ / Edge 133+
 * - Firefox 137+
 * - Safari 18.4+
 *
 * No polyfill is bundled. If your target browsers do not support Temporal,
 * use `NgpNativeDateAdapter` (the default) or an adapter for Luxon / date-fns.
 *
 * ### Wiring in the application
 *
 * ```typescript
 * import { provideDateAdapter } from 'ng-primitives/date-time';
 * import { TemporalAdapter } from '@dragone/ui/date-picker';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideDateAdapter(TemporalAdapter),
 *   ],
 * };
 * ```
 */
@Injectable({ providedIn: 'root' })
export class TemporalAdapter implements NgpDateAdapter<Temporal.PlainDateTime> {
  readonly #platform = inject(Platform);

  /**
   * Create a `Temporal.PlainDateTime` from unit values.
   * Missing fields fall back to the current date/time.
   */
  create(values: NgpDateUnits): Temporal.PlainDateTime {
    const now = Temporal.Now.plainDateTimeISO();

    return this.#platform.FIREFOX
      ? new Temporal.PlainDateTime(
          values.year ?? now.year,
          values.month ?? now.month,
          values.day ?? now.day,
          values.hour ?? now.hour,
          values.minute ?? now.minute,
          values.second ?? now.second,
          values.millisecond ?? now.millisecond,
        )
      : Temporal.PlainDateTime.from({
          year: values.year ?? now.year,
          month: values.month ?? now.month,
          day: values.day ?? now.day,
          hour: values.hour ?? now.hour,
          minute: values.minute ?? now.minute,
          second: values.second ?? now.second,
          millisecond: values.millisecond ?? now.millisecond,
        });
  }

  /** Return the current date and time as a `Temporal.PlainDateTime`. */
  now(): Temporal.PlainDateTime {
    return Temporal.Now.plainDateTimeISO();
  }

  /**
   * Return a new `Temporal.PlainDateTime` with the specified fields
   * replaced. The original is never mutated.
   */
  set(date: Temporal.PlainDateTime, values: NgpDateUnits): Temporal.PlainDateTime {
    return date.with({
      ...(values.year !== undefined && { year: values.year }),
      ...(values.month !== undefined && { month: values.month }),
      ...(values.day !== undefined && { day: values.day }),
      ...(values.hour !== undefined && { hour: values.hour }),
      ...(values.minute !== undefined && { minute: values.minute }),
      ...(values.second !== undefined && { second: values.second }),
      ...(values.millisecond !== undefined && { millisecond: values.millisecond }),
    });
  }

  /**
   * Return a new `Temporal.PlainDateTime` with the given duration added.
   * The field names of `NgpDuration` match `DurationLikeObject` directly,
   * so no mapping is required.
   */
  add(date: Temporal.PlainDateTime, duration: NgpDuration): Temporal.PlainDateTime {
    return date.add(duration);
  }

  /**
   * Return a new `Temporal.PlainDateTime` with the given duration
   * subtracted.
   */
  subtract(date: Temporal.PlainDateTime, duration: NgpDuration): Temporal.PlainDateTime {
    return date.subtract(duration);
  }

  /**
   * Compare two dates. Returns:
   * - `-1` if `a < b`
   * - `0`  if `a === b`
   * - `1`  if `a > b`
   */
  compare(a: Temporal.PlainDateTime, b: Temporal.PlainDateTime): number {
    return Temporal.PlainDateTime.compare(a, b);
  }

  /** `true` if both dates represent the same exact instant in time. */
  isEqual(a: Temporal.PlainDateTime, b: Temporal.PlainDateTime): boolean {
    return a.equals(b);
  }

  /** `true` if `a` is strictly before `b`. */
  isBefore(a: Temporal.PlainDateTime, b: Temporal.PlainDateTime): boolean {
    return Temporal.PlainDateTime.compare(a, b) < 0;
  }

  /** `true` if `a` is strictly after `b`. */
  isAfter(a: Temporal.PlainDateTime, b: Temporal.PlainDateTime): boolean {
    return Temporal.PlainDateTime.compare(a, b) > 0;
  }

  /** `true` if both dates fall on the same calendar day. */
  isSameDay(a: Temporal.PlainDateTime, b: Temporal.PlainDateTime): boolean {
    return a.year === b.year && a.month === b.month && a.day === b.day;
  }

  /** `true` if both dates fall in the same calendar month (same year/month). */
  isSameMonth(a: Temporal.PlainDateTime, b: Temporal.PlainDateTime): boolean {
    return a.year === b.year && a.month === b.month;
  }

  /** `true` if both dates fall in the same calendar year. */
  isSameYear(a: Temporal.PlainDateTime, b: Temporal.PlainDateTime): boolean {
    return a.year === b.year;
  }

  /** Get the year (e.g. 2026). */
  getYear(date: Temporal.PlainDateTime): number {
    return date.year;
  }

  /**
   * Get the month (1-12).
   *
   * @note `Temporal.PlainDateTime.month` is 1-indexed, matching the
   * `NgpDateAdapter` contract directly — no conversion needed.
   */
  getMonth(date: Temporal.PlainDateTime): number {
    return date.month;
  }

  /** Get the day of the month (1-31). */
  getDate(date: Temporal.PlainDateTime): number {
    return date.day;
  }

  /**
   * Get the day of the week.
   *
   * @returns `1` for Monday … `7` for Sunday.
   *
   * @note `Temporal.PlainDateTime.dayOfWeek` uses the same ISO convention
   * (1=Monday … 7=Sunday), so no mapping is needed.
   */
  getDay(date: Temporal.PlainDateTime): number {
    return date.dayOfWeek;
  }

  /** Get the hour (0-23). */
  getHours(date: Temporal.PlainDateTime): number {
    return date.hour;
  }

  /** Get the minute (0-59). */
  getMinutes(date: Temporal.PlainDateTime): number {
    return date.minute;
  }

  /** Get the second (0-59). */
  getSeconds(date: Temporal.PlainDateTime): number {
    return date.second;
  }

  /** Get the millisecond (0-999). */
  getMilliseconds(date: Temporal.PlainDateTime): number {
    return date.millisecond;
  }

  /** Return a new date set to the first moment of the month. */
  startOfMonth(date: Temporal.PlainDateTime): Temporal.PlainDateTime {
    return date.with({ day: 1, hour: 0, minute: 0, second: 0, millisecond: 0 });
  }

  /** Return a new date set to the last moment of the month. */
  endOfMonth(date: Temporal.PlainDateTime): Temporal.PlainDateTime {
    return date.with({
      day: date.daysInMonth,
      hour: 23,
      minute: 59,
      second: 59,
      millisecond: 999,
    });
  }

  /** Return a new date set to the start of the day (midnight). */
  startOfDay(date: Temporal.PlainDateTime): Temporal.PlainDateTime {
    return date.with({ hour: 0, minute: 0, second: 0, millisecond: 0 });
  }

  /** Return a new date set to the last millisecond of the day. */
  endOfDay(date: Temporal.PlainDateTime): Temporal.PlainDateTime {
    return date.with({ hour: 23, minute: 59, second: 59, millisecond: 999 });
  }
}
