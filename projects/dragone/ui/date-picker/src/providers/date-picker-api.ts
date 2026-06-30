import {
  InjectionToken,
  assertInInjectionContext,
  inject,
  type ExistingProvider,
  type Type,
} from '@angular/core';

import type { PublicMembers } from '@dragone/ui/utils';

import type { DatePicker } from '../date-picker';

export type DatePickerApi<T extends Temporal.PlainDateTime | Date> = PublicMembers<DatePicker<T>>;

export const DATE_PICKER_API_TOKEN = new InjectionToken<
  DatePickerApi<Temporal.PlainDateTime | Date>
>('DatePickerApi');

export const injectDatePickerApi = <
  T extends Temporal.PlainDateTime | Date,
>(): DatePickerApi<T> => {
  assertInInjectionContext(injectDatePickerApi);
  return inject(DATE_PICKER_API_TOKEN) as unknown as DatePickerApi<T>;
};

export const provideDatePickerApi = <T extends Temporal.PlainDateTime | Date>(
  type: Type<DatePicker<T>>,
): ExistingProvider => ({
  provide: DATE_PICKER_API_TOKEN,
  useExisting: type,
});
