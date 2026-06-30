import type { InputSignal, InputSignalWithTransform, OutputRef } from '@angular/core';
import { Component, computed, effect, input } from '@angular/core';
import type { ValidationError } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCalendarDay } from '@ng-icons/font-awesome/solid';
import { injectDatePickerState, NgpDatePicker } from 'ng-primitives/date-picker';
import { injectDateAdapter } from 'ng-primitives/date-time';
import { NgpPopoverTrigger, NgpPopover } from 'ng-primitives/popover';

import { Button } from '@dragone/ui/button';
import { InputGroup } from '@dragone/ui/input';
import { toValue } from '@dragone/ui/utils';

import { Calendar } from './components/calendar/calendar';
import { InputDatePicker } from './components/input-date-picker';
import { provideDatePickerApi } from './providers/date-picker-api';
import { parseLocaleDateString } from './utils/parse-date';

@Component({
  selector: 'drgn-date-picker',
  imports: [NgIcon, InputGroup, InputDatePicker, Calendar, Button, NgpPopoverTrigger, NgpPopover],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.css',
  providers: [provideIcons({ faSolidCalendarDay }), provideDatePickerApi(DatePicker)],
  hostDirectives: [
    {
      directive: NgpDatePicker,
      inputs: [
        'ngpDatePickerDate: value',
        'ngpDatePickerMin: min',
        'ngpDatePickerMax: max',
        'ngpDatePickerDisabled: disabled',
        'ngpDatePickerFirstDayOfWeek: firstDayOfWeek',
        'ngpDatePickerDateDisabled: dateDisabled',
        'ngpDatePickerFocusedDate: focusedDate',
      ],
      outputs: ['ngpDatePickerDateChange: valueChange'],
    },
  ],
})
export class DatePicker<T extends Temporal.PlainDateTime | Date> {
  errors?:
    | InputSignal<readonly ValidationError.WithOptionalFieldTree[]>
    | InputSignalWithTransform<readonly ValidationError.WithOptionalFieldTree[], unknown>
    | undefined;
  readonly?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown> | undefined;
  hidden?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown> | undefined;
  invalid?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown> | undefined;
  pending?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown> | undefined;

  name?: InputSignal<string> | InputSignalWithTransform<string, unknown> | undefined;
  required?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown> | undefined;
  touch?: OutputRef<void> | undefined;
  readonly keepInvalid = input(true);
  readonly locale = input('it-IT');
  readonly options = input<Partial<Intl.DateTimeFormatOptions>>({
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  readonly ariaLabelCalendar = input('Scegli Data');
  readonly ariaDescribedByInput = input<string>();
  readonly #adapter = injectDateAdapter<T>();
  readonly #datePickerState = injectDatePickerState<T>();

  /** Formatter derived from locale / options inputs — re‑created only when those change. */
  readonly #formatter = computed(() => new Intl.DateTimeFormat(this.locale(), this.options()));

  focus?(_options?: FocusOptions): void {
    throw new Error('Method not implemented.');
  }
  reset?(): void {
    throw new Error('Method not implemented.');
  }

  constructor() {
    const refEffect = effect(() => {
      const date = toValue(this.#datePickerState().date);
      if (date) {
        toValue.untracked(this.#datePickerState().focusedDate.set(date));
      }
      refEffect.destroy();
    });
    this.#datePickerState().firstDayOfWeek.set(1);
  }

  /** Format a date value to string, handling `undefined`. */
  format(value: T | undefined): string {
    if (value === undefined) return '';
    return this.#formatter().format(value);
  }

  /**
   * Parse a locale‑formatted string into a Date/Temporal object, using the current formatter (which
   * is derived from {@link locale} / {@link options}).
   */
  parseDate(value: string): T | undefined {
    return parseLocaleDateString(value, this.#adapter, this.#formatter());
  }
}
