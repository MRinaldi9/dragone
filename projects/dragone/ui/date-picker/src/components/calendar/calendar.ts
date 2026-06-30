import { Component, computed } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidAngleLeft,
  faSolidAngleRight,
} from '@ng-icons/font-awesome/solid';
import {
  injectDatePickerState,
  NgpDatePickerCell,
  NgpDatePickerDateButton,
  NgpDatePickerGrid,
  NgpDatePickerLabel,
  NgpDatePickerNextMonth,
  NgpDatePickerPreviousMonth,
  NgpDatePickerRowRender,
} from 'ng-primitives/date-picker';
import { injectDateAdapter } from 'ng-primitives/date-time';

import { injectDatePickerApi } from '../../providers/date-picker-api';
import { getLocaleWeekDays } from '../../utils/week-day';
import { DrgnCalendarCellRender } from './calendar-cell-render';

@Component({
  selector: 'drgn-calendar',
  imports: [
    NgIcon,
    NgpDatePickerLabel,
    NgpDatePickerNextMonth,
    NgpDatePickerPreviousMonth,
    NgpDatePickerGrid,
    NgpDatePickerCell,
    NgpDatePickerRowRender,
    DrgnCalendarCellRender,
    NgpDatePickerDateButton,
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.css',
  providers: [
    provideIcons({
      faSolidAngleLeft,
      faSolidAngleRight,
    }),
  ],
})
export class Calendar<T extends Temporal.PlainDateTime | Date> {
  readonly #state = injectDatePickerState<T>();
  readonly #adapter = injectDateAdapter<T>();
  readonly #datePickerApi = injectDatePickerApi<T>();

  readonly #dayLabels = computed(() =>
    getLocaleWeekDays('short', this.#datePickerApi.locale()),
  );

  readonly #dayAbbrs = computed(() =>
    getLocaleWeekDays('long', this.#datePickerApi.locale()),
  );

  /**
   * Ordered day-of-week headers based on {@link firstDayOfWeek}.
   *
   * `firstDayOfWeek` uses ng-primitives convention: `1` = Monday, `7` = Sunday.
   * {@link getLocaleWeekDays} returns a Monday-indexed array (0 = Monday, 6 = Sunday), so `firstDay
   * - 1` maps directly to the correct start index.
   */
  readonly dayHeaders = computed(() => {
    const firstDay = this.#state().firstDayOfWeek();
    // Monday-indexed array: 1 (Monday) → 0, 7 (Sunday) → 6
    const startIndex = firstDay - 1;
    const labels = this.#dayLabels();
    const abbrs = this.#dayAbbrs();
    const result: { label: string; abbr: string }[] = [];

    for (let i = 0; i < labels.length; i++) {
      const idx = (startIndex + i) % 7;
      result.push({ label: labels[idx], abbr: abbrs[idx] });
    }
    return result;
  });

  readonly label = computed(
    (focusedData = this.#state().focusedDate()) =>
      `${focusedData.toLocaleString(this.#datePickerApi.locale(), { month: 'long' })} ${focusedData.toLocaleString(this.#datePickerApi.locale(), { year: 'numeric' })}`,
  );

  /**
   * Extract the day-of-month number from a date of either supported type.
   *
   * The template context types `date` as `Temporal.PlainDateTime | Date` (the generic constraint)
   * because the template checker cannot infer `T`. At runtime the value is always `T` — it
   * originates from the same date picker state that the adapter serves — so the cast is safe.
   */
  protected dayOfMonth(date: T): number {
    return this.#adapter.getDate(date);
  }
}
