import type { InputSignal, InputSignalWithTransform, OutputRef } from '@angular/core';
import { Component, computed, debounced, effect, linkedSignal } from '@angular/core';
import type { ValidationError } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCalendar } from '@ng-icons/font-awesome/solid';
import {
  injectDatePickerState,
  NgpDatePicker,
  NgpDatePickerCell,
  NgpDatePickerCellRender,
  NgpDatePickerDateButton,
  NgpDatePickerGrid,
  NgpDatePickerLabel,
  NgpDatePickerNextMonth,
  NgpDatePickerPreviousMonth,
  NgpDatePickerRowRender,
} from 'ng-primitives/date-picker';

import { InputGroup } from '@dragone/ui/input';

import { injectFormatDate } from '../format-date';
import { injectParseDate } from '../parse-date';

@Component({
  selector: 'drgn-date-picker',
  imports: [
    NgIcon,
    NgpDatePickerLabel,
    NgpDatePickerNextMonth,
    NgpDatePickerPreviousMonth,
    NgpDatePickerGrid,
    NgpDatePickerCell,
    NgpDatePickerRowRender,
    NgpDatePickerCellRender,
    NgpDatePickerDateButton,
    InputGroup,
  ],
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.css',
  providers: [provideIcons({ faSolidCalendar })],
  hostDirectives: [
    {
      directive: NgpDatePicker,
      inputs: [
        'ngpDatePickerDate: value',
        'ngpDatePickerMin: min',
        'ngpDatePickerMax: max',
        'ngpDatePickerDisabled: disabled',
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
  readonly #datePickerState = injectDatePickerState<T>();
  readonly #formatter = injectFormatDate();
  readonly #parseDate = injectParseDate<T>();

  /**
   * The formatted date string displayed in the input.
   *
   * - **Source** (`#datePickerState().date`): when the picker's value changes
   *   (from calendar selection or programmatic set) the linked signal re-syncs
   *   by formatting the new date.
   * - **Local write**: when the user types in the input, `valueDate.set()` is
   *   called directly, keeping the typed text visible until it is parsed.
   */
  valueDate = linkedSignal({
    source: this.#datePickerState().date,
    computation: curr => this.#format(curr),
  });

  /**
   * Debounced version of `valueDate`.
   * Used to trigger validation & re‑parsing after the user stops typing.
   */
  debouncedValueDate = debounced(this.valueDate, 300);

  /**
   * `true` when the currently displayed string is a valid date
   * (either unchanged from the current picker value or parseable).
   */
  isValidDate = computed(
    (raw = this.debouncedValueDate.value()) =>
      raw === this.#format(this.#datePickerState().date()) || this.#parseDate(raw) !== null,
  );

  constructor() {
    // When the user finishes typing, try to parse the string and push it
    // Back to the date picker's model.
    // Effect(() => {
    //   Const raw = this.debouncedValueDate.value();
    //   // No-op if the text hasn't diverged from the current picker value
    //   If (raw === this.#format(this.#datePickerState().date())) {
    //     Return;
    //   }
    //   Const parsed = this.#parseDate(raw);
    //   If (parsed !== null) {
    //     This.#datePickerState().date.set(parsed);
    //   }
    //   // If `parsed` is null the string is invalid — the effect does nothing
    //   // And lets the UI keep showing the invalid text so the user can correct it.
    // });
  }

  /** Format a date value to string, handling `undefined`. */
  #format(value: T | undefined): string {
    if (value === undefined) return '';
    return this.#formatter.format(value);
  }

  focus?(options?: FocusOptions): void {
    throw new Error('Method not implemented.');
  }
  reset?(): void {
    throw new Error('Method not implemented.');
  }
}
