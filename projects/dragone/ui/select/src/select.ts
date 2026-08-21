import { booleanAttribute, Component, computed, input, linkedSignal, output } from '@angular/core';
import { outputFromObservable, outputToObservable } from '@angular/core/rxjs-interop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCheck, faSolidChevronDown } from '@ng-icons/font-awesome/solid';
import {
  injectSelectState,
  NgpSelect,
  NgpSelectDropdown,
  NgpSelectOption,
  NgpSelectPortal,
} from 'ng-primitives/select';
import { map } from 'rxjs';

import { isNil, type KeyOf, type LiteralUnion } from '@dragone/ui/utils';

type OptionPrimitive = string | number | boolean;
type OptionObject<T extends object = Record<string, unknown>> = T & { disabled?: boolean };
type Option<T> = T extends object ? OptionObject<T> : OptionPrimitive;
type SelectValue<T> = Option<T> | Option<T>[] | null | undefined;
type OptionKey<T> = LiteralUnion<KeyOf<T>, string>;

@Component({
  selector: 'drgn-select',
  imports: [NgpSelectDropdown, NgpSelectOption, NgpSelectPortal, NgIcon],
  templateUrl: './select.component.html',
  styleUrl: './select.css',
  providers: [provideIcons({ faSolidChevronDown, faSolidCheck })],
  host: {
    class: 'drgn-label-md-400',
    '[ariaLabel]': 'ariaLabelledBy() ? undefined : (ariaLabel() || placeholder())',
    '[attr.aria-labelledby]': 'ariaLabelledBy()',
    '[attr.name]': 'name()',
    '[attr.readonly]': 'readonly() ? "" : undefined',
    '[attr.hidden]': 'hidden() ? "" : undefined',
    '(blur)': 'touch.emit()',
  },
  hostDirectives: [
    {
      directive: NgpSelect,
      inputs: [
        'id',
        'ngpSelectDisabled: disabled',
        'ngpSelectValue: value',
        'ngpSelectMultiple: multiple',
        'ngpSelectCompareWith: compare',
      ],
      outputs: ['ngpSelectOpenChange: openChange'],
    },
  ],
})
export class Select<T> {
  readonly options = input<Option<T>[]>();
  /**
   * The selected value. Declared as an input so that `FormField` recognizes
   * `Select` as a custom form control (paired with the `valueChange` output).
   */
  readonly value = input<SelectValue<T>>();
  readonly placeholder = input<string>();
  /**
   * A string that maps an option to its display label. If not provided, the option itself will be used as the label.
   */
  readonly optionLabel = input<OptionKey<T>>();
  /** A string that maps an option to its value. If not provided, the option itself will be used as the value. */
  readonly optionValue = input<OptionKey<T>>();
  readonly ariaLabel = input<string>();
  readonly ariaLabelledBy = input<string>();
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly hidden = input(false, { transform: booleanAttribute });
  readonly name = input<string>();
  readonly touch = output<void>();
  readonly #internalState = injectSelectState<SelectValue<T>>();

  readonly valueChange = outputFromObservable(
    outputToObservable(this.#internalState().valueChange).pipe(
      map(value => this.mapByKey(value, this.optionValue())),
    ),
  );

  protected readonly internalValue = linkedSignal(this.#internalState().value);

  protected readonly canShowValue = computed(() => {
    const value = this.internalValue();
    if (this.#internalState().multiple() && Array.isArray(value)) {
      return value.length > 0;
    }
    return !isNil(value);
  });

  /**
   * Value shown inside the trigger when at least one option is selected.
   * It applies `optionLabel` mapping when provided.
   */
  protected readonly mappedValue = computed(() =>
    this.mapByKey(this.internalValue(), this.optionLabel()),
  );

  /**
   * View model used by the dropdown template.
   * It precomputes label and selected state for each option.
   */
  protected readonly optionItems = computed(() => {
    const selectedValue = this.internalValue();
    return (this.options() ?? []).map(option => ({
      value: option,
      label: this.mapByKey(option, this.optionLabel()),
      selected: this.isOptionSelected(option, selectedValue),
    }));
  });

  /**
   * Maps a value (or a list of values) to its display/emitted form.
   * When `key` is set, extracts that property from object values; otherwise returns the value as-is.
   */
  private mapByKey(value: SelectValue<T>, key?: PropertyKey): unknown {
    if (Array.isArray(value)) {
      return value.map(option => this.mapByKey(option, key));
    }
    if (isNil(value) || typeof value !== 'object' || !key) {
      return value;
    }
    return (value as Record<PropertyKey, unknown>)[key];
  }

  /**
   * Returns whether the current option is selected.
   * Selection is delegated to `compareWith` from `ng-primitives` state.
   */
  private isOptionSelected(currOption: Option<T>, selectedValue: SelectValue<T>): boolean {
    const compareWith = this.#internalState().compareWith();
    if (Array.isArray(selectedValue)) {
      return selectedValue.some(value => compareWith(value, currOption));
    }
    return compareWith(selectedValue, currOption);
  }
}
