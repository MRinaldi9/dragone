import { computed, type Signal } from '@angular/core';
import { injectDatePickerState, type NgpDatePickerState } from 'ng-primitives/date-picker';
import { injectDateAdapter } from 'ng-primitives/date-time';
import { createPrimitive, type StateInjectionOptions } from 'ng-primitives/state';

import { injectDragoneDatePickerConfig } from '../providers/date-picker-config';
import type { IETFLanguageTag } from '../utils/guards';
import { normalizeToDate } from '../utils/normalize-to-date';
import { parseLocaleDateString } from '../utils/parse-date';
import { findNearestEnabledDate } from '../utils/period';

export type DatePickerState<T> = NgpDatePickerState<T> & {
  format: (date: T | undefined) => string;
  parseDate: (value: string) => T | undefined;
  keepInvalid: Signal<boolean>;
  dayAbbrs: Signal<string[]>;
  locale: Signal<IETFLanguageTag>;
  monthsLocale: Signal<string[]>;
  showToday: Signal<boolean>;
  /**
   * Resolve `date` to the nearest enabled date within the picker's `dateDisabled`/`min`/`max`
   * constraints and set the focused date accordingly.
   */
  setResolveFocusedDate: (date: T) => void;
};

export const [
  ,
  datePickerDragoneStateFactory,
  _injectDatePickerDragoneState,
  provideDatePickerDragoneState,
] = createPrimitive(
  'DatePickerStateDragone',
  <T>({
    locale: _locale,
    options,
    keepInvalid,
    showToday,
  }: {
    locale: Signal<IETFLanguageTag | undefined>;
    options: Signal<Intl.DateTimeFormatOptions | undefined>;
    keepInvalid: Signal<boolean>;
    showToday: Signal<boolean>;
  }): DatePickerState<T> => {
    const _datePickerConfig = injectDragoneDatePickerConfig();
    const _dateAdapter = injectDateAdapter<T>();
    const _datePickerState = injectDatePickerState<T>();
    const locale = computed(() => _locale() ?? _datePickerConfig.locale!);

    /** Formatter derived from locale / options inputs — re‑created only when those change. */
    const _formatter = computed(() => {
      const localeValue = locale();
      const optionsValue = { ..._datePickerConfig.options, ...options() };
      return new Intl.DateTimeFormat(localeValue, optionsValue);
    });

    function format(date: T | undefined): string {
      if (!date) return '';
      return _formatter().format(normalizeToDate(date, _dateAdapter));
    }

    function parseDate(value: string): T | undefined {
      return parseLocaleDateString(value, _dateAdapter, _formatter());
    }

    function _getLocaleWeekDays(weekday: Intl.DateTimeFormatOptions['weekday']): string[] {
      const { format } = new Intl.DateTimeFormat(locale(), {
        weekday,
      });
      return Array.from({ length: 7 }, (_, i) => format(new Date(2020, 5, i + 1)));
    }

    function _getLocaleMonths(month: Intl.DateTimeFormatOptions['month']): string[] {
      const { format } = new Intl.DateTimeFormat(locale(), {
        month,
      });
      return Array.from({ length: 12 }, (_, i) => format(new Date(2020, i, 1)));
    }

    const dayAbbrs = computed(() => _getLocaleWeekDays('short'));
    const monthsLocale = computed(() => _getLocaleMonths('long'));

    function setResolveFocusedDate(date: T): void {
      const state = _datePickerState();
      state.setFocusedDate(
        findNearestEnabledDate(_dateAdapter, date, candidate => state.dateDisabled()(candidate), {
          min: state.min(),
          max: state.max(),
        }),
        'program',
        'forward',
      );
    }

    return {
      ..._datePickerState(),
      format,
      parseDate,
      keepInvalid,
      dayAbbrs,
      locale,
      monthsLocale,
      showToday,
      setResolveFocusedDate,
    };
  },
);

export function injectDatePickerDragoneState<T>(): Signal<DatePickerState<T>>;
export function injectDatePickerDragoneState<T>(
  options: StateInjectionOptions,
): Signal<NgpDatePickerState<T> | null>;
export function injectDatePickerDragoneState<T>(
  options?: StateInjectionOptions,
): Signal<NgpDatePickerState<T> | null> {
  return _injectDatePickerDragoneState(options) as Signal<DatePickerState<T> | null>;
}
