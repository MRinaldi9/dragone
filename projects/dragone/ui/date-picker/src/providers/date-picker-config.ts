import {
  assertInInjectionContext,
  inject,
  InjectionToken,
  type Provider,
  type Type,
} from '@angular/core';
import {
  injectDatePickerConfig as injectInternalConfig,
  provideDatePickerConfig as provideInternalConfig,
  type NgpDatePickerFirstDayOfWeekNumber,
} from 'ng-primitives/date-picker';
import { provideDateAdapter, type NgpDateAdapter } from 'ng-primitives/date-time';

import type { IETFLanguageTag } from '../utils/guards';

export interface DatePickerConfig<
  T extends Temporal.PlainDateTime | Date = Temporal.PlainDateTime | Date,
> {
  firstDayOfWeek?: NgpDatePickerFirstDayOfWeekNumber;
  locale?: IETFLanguageTag;
  options?: Intl.DateTimeFormatOptions;
  adapter?: Type<NgpDateAdapter<T>>;
}

export const CONFIG_TOKEN = new InjectionToken<Omit<DatePickerConfig, 'firstDayOfWeek'>>(
  'DatePickerConfig',
);

export const provideDragoneDatePickerConfig = (config?: DatePickerConfig): Provider[] => {
  const {
    firstDayOfWeek = 1,
    locale = 'it-IT',
    options = { day: '2-digit', month: '2-digit', year: 'numeric' },
    adapter,
  } = config ?? {};
  return [
    provideInternalConfig({ firstDayOfWeek }),
    { provide: CONFIG_TOKEN, useValue: { locale, options } },
    ...(adapter ? [provideDateAdapter(adapter)] : ([] as Provider[])),
  ];
};

export const injectDragoneDatePickerConfig = (): DatePickerConfig => {
  assertInInjectionContext(injectDragoneDatePickerConfig);
  const { locale, options } = inject(CONFIG_TOKEN);
  const internalConfig = injectInternalConfig();
  return { locale, options, ...internalConfig };
};
