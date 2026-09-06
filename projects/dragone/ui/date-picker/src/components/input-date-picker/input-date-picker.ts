import { computed, debounced, Directive, effect, linkedSignal, untracked } from '@angular/core';

import { toValue } from '@dragone/ui/utils';

import { injectInputDebounceTimer } from '../../providers/debounce-input-timer';
import { injectDatePickerDragoneState } from '../../state/date-picker-state';

@Directive({
  selector: 'input[date-picker]',
  host: {
    type: 'text',
    role: 'combobox',
    autocomplete: 'off',
    'aria-autocomplete': 'none',
    '[value]': 'inputDate()',
    '(input)': 'changeDate($event)',
    '[attr.data-invalid]': 'isValidDate() ? null : ""',
    '[attr.aria-invalid]': '!isValidDate() || undefined',
  },
})
export class InputDatePicker<T> {
  readonly #dragoneDatePickerState = injectDatePickerDragoneState<T>();
  readonly #debounceTimer = injectInputDebounceTimer();
  /**
   * The formatted date string displayed in the input.
   *
   * - **Source** (`#datePickerState().date`): when the picker's value changes (from calendar
   *   selection or programmatic set) the linked signal re-syncs by formatting the new date.
   * - **Local write**: when the user types in the input, `valueDate.set()` is called directly,
   *   keeping the typed text visible until it is parsed.
   */
  protected inputDate = linkedSignal({
    source: this.#dragoneDatePickerState().date,
    computation: curr => this.#dragoneDatePickerState().format(curr),
  });

  /**
   * Debounced version of `valueDate`. Used to trigger validation & re‑parsing after the user stops
   * typing.
   */
  private debouncedInputDate = debounced(this.inputDate, this.#debounceTimer);

  /**
   * `true` when the currently displayed string is a valid date (either unchanged from the current
   * picker value or parseable).
   */
  isValidDate = computed(
    (raw = this.debouncedInputDate.value()) =>
      raw === this.#dragoneDatePickerState().format(this.#dragoneDatePickerState().date()) ||
      this.#dragoneDatePickerState().parseDate(raw) !== undefined,
  );

  constructor() {
    // When the user finishes typing, try to parse the string and push it
    // Back to the date picker's model.
    effect(() => {
      const raw = this.debouncedInputDate.value();
      // No-op if the text hasn't diverged from the current picker value
      if (
        raw ===
        this.#dragoneDatePickerState().format(
          toValue.untracked(this.#dragoneDatePickerState().date),
        )
      ) {
        return;
      }
      const parsed = this.#dragoneDatePickerState().parseDate(raw);
      // If `parsed` is null the string is invalid — the effect does nothing
      // And lets the UI keep showing the invalid text so the user can correct it.
      if (!toValue.untracked(this.#dragoneDatePickerState().keepInvalid) && !parsed) {
        this.inputDate.set('');
        return;
      }
      if (!parsed) {
        return;
      }
      untracked(() => {
        // Select the parsed date so the calendar shows it as selected, and move the
        // focus so the calendar view (month/year) follows the typed date.
        this.#dragoneDatePickerState().select(parsed);
        this.#dragoneDatePickerState().setFocusedDate(parsed, 'program', 'forward');
      });
    });
  }

  protected changeDate(ev: InputEvent): void {
    const { value } = ev.target as HTMLInputElement;
    this.inputDate.set(value);
  }
}
