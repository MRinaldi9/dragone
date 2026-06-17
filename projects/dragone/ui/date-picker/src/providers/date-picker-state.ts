import { InjectionToken, assertInInjectionContext, inject } from '@angular/core';

import type { PublicMembers } from '@dragone/ui/utils';

import type { DatePicker } from '../date-picker';

export type DatePickerState<T extends Temporal.PlainDateTime | Date> = PublicMembers<DatePicker<T>>;

export const DATE_PICKER_STATE_TOKEN = new InjectionToken<
  DatePickerState<Temporal.PlainDateTime | Date>
>('DatePickerState');

export const injectDatePickerState = <
  T extends Temporal.PlainDateTime | Date,
>(): DatePickerState<T> => {
  assertInInjectionContext(injectDatePickerState);
  return inject(DATE_PICKER_STATE_TOKEN) as unknown as DatePickerState<T>;
};
