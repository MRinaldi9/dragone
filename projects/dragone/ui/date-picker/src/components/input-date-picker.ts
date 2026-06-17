import { computed, debounced, Directive, effect, linkedSignal, untracked } from '@angular/core';
import { injectDatePickerState } from 'ng-primitives/date-picker';

import { toValue } from '@dragone/ui/utils';

import { injectDatePickerState as stateComponent } from '../providers/date-picker-state';
import { injectInputDebounceTimer } from '../providers/debounce-input-timer';

@Directive({
  selector: 'input[date-picker]',
  host: {
    type: 'text',
    '[value]': 'inputDate()',
    '(input)': 'changeDate($event)',
    '[attr.data-invalid]': 'isValidDate() ? null : ""',
    '[attr.aria-invalid]': '!isValidDate() || undefined',
  },
})
export class InputDatePicker<T extends Temporal.PlainDateTime | Date> {
  readonly #datePickerState = injectDatePickerState<T>();
  readonly #stateComp = stateComponent<T>();
  readonly #debounceTimer = injectInputDebounceTimer();
  /**
   * The formatted date string displayed in the input.
   *
   * - **Source** (`#datePickerState().date`): when the picker's value changes
   *   (from calendar selection or programmatic set) the linked signal re-syncs
   *   by formatting the new date.
   * - **Local write**: when the user types in the input, `valueDate.set()` is
   *   called directly, keeping the typed text visible until it is parsed.
   */
  protected inputDate = linkedSignal({
    source: this.#datePickerState().date,
    computation: curr => this.#stateComp.format(curr),
  });

  /**
   * Debounced version of `valueDate`.
   * Used to trigger validation & re‑parsing after the user stops typing.
   */
  private debouncedInputDate = debounced(this.inputDate, this.#debounceTimer);

  /**
   * `true` when the currently displayed string is a valid date
   * (either unchanged from the current picker value or parseable).
   */
  isValidDate = computed(
    (raw = this.debouncedInputDate.value()) =>
      raw === this.#stateComp.format(this.#datePickerState().date()) ||
      this.#stateComp.parseDate(raw) !== undefined,
  );

  constructor() {
    // When the user finishes typing, try to parse the string and push it
    // Back to the date picker's model.
    effect(() => {
      const raw = this.debouncedInputDate.value();
      // No-op if the text hasn't diverged from the current picker value
      if (raw === this.#stateComp.format(this.#datePickerState().date())) {
        return;
      }
      const parsed = this.#stateComp.parseDate(raw);
      // If `parsed` is null the string is invalid — the effect does nothing
      // And lets the UI keep showing the invalid text so the user can correct it.
      if (!toValue.untracked(this.#stateComp.keepInvalid) && !parsed) {
        this.inputDate.set('');
      }
      untracked(() => {
        this.#datePickerState().date.set(parsed);
        this.#datePickerState().dateChange.emit(parsed);
      });
    });
  }

  protected changeDate(ev: InputEvent): void {
    const { value } = ev.target as HTMLInputElement;
    this.inputDate.set(value);
  }
}
