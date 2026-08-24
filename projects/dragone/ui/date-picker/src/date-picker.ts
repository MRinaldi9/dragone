import type { InputSignal, InputSignalWithTransform, OutputRef } from '@angular/core';
import { Component, effect, input } from '@angular/core';
import type { ValidationError } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCalendarDay } from '@ng-icons/font-awesome/solid';
import { injectDatePickerState, NgpDatePicker } from 'ng-primitives/date-picker';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';

import { Button } from '@dragone/ui/button';
import { InputGroup } from '@dragone/ui/input';
import { toValue } from '@dragone/ui/utils';

import { Calendar } from './components/calendar/calendar';
import { InputDatePicker } from './components/input-date-picker';
import {
  datePickerDragoneStateFactory,
  provideDatePickerDragoneState,
} from './state/date-picker-state';
import { isETFLanguageTag, type IETFLanguageTag } from './utils/guards';

@Component({
  selector: 'drgn-date-picker',
  imports: [NgIcon, InputGroup, InputDatePicker, Calendar, Button, NgpPopoverTrigger, NgpPopover],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.css',
  providers: [
    provideIcons({ faSolidCalendarDay }),
    provideDatePickerDragoneState({ inherit: false }),
  ],
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
  readonly locale = input<IETFLanguageTag, string>(undefined, {
    transform: val => {
      isETFLanguageTag(val);
      return val;
    },
  });
  readonly options = input<Partial<Intl.DateTimeFormatOptions>>();
  readonly ariaLabelCalendar = input('Scegli Data');
  readonly ariaDescribedByInput = input<string>();
  readonly #datePickerState = injectDatePickerState<T>();

  focus?(_options?: FocusOptions): void {
    throw new Error('Method not implemented.');
  }
  reset?(): void {
    throw new Error('Method not implemented.');
  }

  constructor() {
    datePickerDragoneStateFactory({
      locale: this.locale,
      options: this.options,
      keepInvalid: this.keepInvalid,
    });
    const refEffect = effect(() => {
      const date = toValue(this.#datePickerState().date);
      if (date) {
        toValue.untracked(this.#datePickerState().setFocusedDate(date, 'program', 'backward'));
      }
      refEffect.destroy();
    });
  }
}
