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

export interface DatePickerConfigOptions<T> {
  /**
   * The first day of the week
   *
   * @default 1
   */
  firstDayOfWeek?: NgpDatePickerFirstDayOfWeekNumber;
  /**
   * The locale for the date picker
   *
   * @default 'it-IT'
   */
  locale?: IETFLanguageTag;
  /**
   * The options for formatting dates in the date picker
   *
   * @default { day: '2-digit', month: '2-digit', year: 'numeric' }
   */
  options?: Intl.DateTimeFormatOptions;
  /**
   * The date adapter for the date picker, if not provided the default `Date` will be used.
   *
   * @default undefined
   */
  adapter?: Type<NgpDateAdapter<T>>;
}

export type DatePickerConfig<T> = Omit<Required<DatePickerConfigOptions<T>>, 'adapter'>;

export const CONFIG_TOKEN = new InjectionToken<
  Pick<DatePickerConfig<unknown>, 'locale' | 'options'>
>('DatePickerConfig');

export const provideDragoneDatePickerConfig = <T>(
  config?: DatePickerConfigOptions<T>,
): Provider[] => {
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

export const injectDragoneDatePickerConfig = <T>(): DatePickerConfig<T> => {
  assertInInjectionContext(injectDragoneDatePickerConfig);
  const { locale, options } = inject(CONFIG_TOKEN);
  const internalConfig = injectInternalConfig();
  return { locale, options, ...internalConfig };
};
