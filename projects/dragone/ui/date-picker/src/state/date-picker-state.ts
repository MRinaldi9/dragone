import { computed, type Signal } from '@angular/core';
import { injectDateAdapter } from 'ng-primitives/date-time';
import { createPrimitive } from 'ng-primitives/state';

import { injectDragoneDatePickerConfig } from '../providers/date-picker-config';
import type { IETFLanguageTag } from '../utils/guards';
import { parseLocaleDateString } from '../utils/parse-date';

export interface DatePickerState<T extends Temporal.PlainDateTime | Date> {
  format: (date: T | undefined) => string;
  parseDate: (value: string) => T | undefined;
  keepInvalid: Signal<boolean>;
  dayAbbrs: Signal<string[]>;
  dayLabels: Signal<string[]>;
  locale: Signal<IETFLanguageTag>;
}

export const [
  ,
  datePickerDragoneStateFactory,
  injectDatePickerDragoneState,
  provideDatePickerDragoneState,
] = createPrimitive(
  'DatePickerDragone',
  <T extends Temporal.PlainDateTime | Date>({
    locale: _locale,
    options,
    keepInvalid,
  }: {
    locale: Signal<IETFLanguageTag | undefined>;
    options: Signal<Intl.DateTimeFormatOptions | undefined>;
    keepInvalid: Signal<boolean>;
  }): DatePickerState<T> => {
    const _datePickerConfig = injectDragoneDatePickerConfig();
    const _dateAdapter = injectDateAdapter<T>();
    const locale = computed(() => _locale() ?? _datePickerConfig.locale!);

    /** Formatter derived from locale / options inputs — re‑created only when those change. */
    const _formatter = computed(() => {
      const localeValue = locale();
      const optionsValue = { ..._datePickerConfig.options, ...options() };
      return new Intl.DateTimeFormat(localeValue, optionsValue);
    });

    function format(date: T | undefined): string {
      if (!date) return '';
      return _formatter().format(date);
    }

    function parseDate(value: string): T | undefined {
      return parseLocaleDateString(value, _dateAdapter, _formatter());
    }

    function _getWeekDays(weekday: Intl.DateTimeFormatOptions['weekday']): string[] {
      const { format } = new Intl.DateTimeFormat(locale(), {
        weekday,
      });
      return Array.from({ length: 7 }, (_, i) => format(new Date(2020, 5, i + 1)));
    }

    const dayAbbrs = computed(() => _getWeekDays('short'));
    const dayLabels = computed(() => _getWeekDays('long'));

    return {
      format,
      parseDate,
      keepInvalid,
      dayAbbrs,
      dayLabels,
      locale,
    };
  },
);
