import {
  booleanAttribute,
  Component,
  computed,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import {
  outputFromObservable,
  outputToObservable,
} from '@angular/core/rxjs-interop';
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

import { isNotNil } from '@dragone/ui/utils';

type OptionPrimitive = string | number | boolean;
type OptionObject<T> = T & { disabled?: boolean };
type Option<T> = T extends object ? OptionObject<T> : OptionPrimitive;
type SelectValue<T> = Option<T> | Option<T>[] | null | undefined;

/**
 * The type of a resolved option value after applying `optionLabel` or `optionValue` mapping.
 * - when `T` is primitive, the resolved type is `T` itself.
 * - when `T` is an object, it can be either `T` or one of its property values.
 */
type SelectResolved<T> = Option<T> | (T extends object ? T[keyof T] : never);

@Component({
  selector: 'drgn-select',
  imports: [NgpSelectDropdown, NgpSelectOption, NgpSelectPortal, NgIcon],
  templateUrl: './select.component.html',
  styleUrl: './select.css',
  providers: [provideIcons({ faSolidChevronDown, faSolidCheck })],
  host: {
    class: 'drgn-label-md-400',
    '[ariaLabel]':
      'ariaLabelledBy() ? undefined : (ariaLabel() || placeholder())',
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
  readonly value = input<SelectValue<T>>();
  readonly placeholder = input<string>();
  /**
   * A string that maps an option to its display label. If not provided, the option itself will be
   * used as the label.
   */
  readonly optionLabel = input<T extends object ? keyof T : never>();
  /**
   * A string that maps an option to its value. If not provided, the option itself will be used as
   * the value.
   */
  readonly optionValue = input<T extends object ? keyof T : never>();
  readonly ariaLabel = input<string>();
  readonly ariaLabelledBy = input<string>();
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly hidden = input(false, { transform: booleanAttribute });
  readonly name = input<string>();
  readonly touch = output<void>();
  readonly #internalState = injectSelectState<SelectValue<T>>();

  readonly valueChange = outputFromObservable(
    outputToObservable(this.#internalState().valueChange).pipe(
      map((value) => {
        if (Array.isArray(value)) {
          return value.map((val) => this.mapOutputValue(val));
        }
        return this.mapOutputValue(value);
      }),
    ),
  );

  protected readonly internalValue = linkedSignal(this.#internalState().value);
  protected readonly canShowValue = computed(() => {
    const isMultiple = this.#internalState().multiple();
    const value = this.internalValue();
    if (isMultiple && Array.isArray(value)) {
      return value.length > 0;
    }
    return isNotNil(value);
  });

  /**
   * Value shown inside the trigger when at least one option is selected. It applies `optionLabel`
   * mapping when provided.
   */
  protected readonly mappedValue = computed(() =>
    this.mapOption(this.internalValue()),
  );

  /**
   * View model used by the dropdown template. It precomputes label and selected state for each
   * option.
   */
  protected readonly optionItems = computed(() => {
    const selectedValue = this.internalValue();
    return (
      this.options()?.map((option) => ({
        value: option,
        label: this.mapOption(option),
        selected: this.isOptionSelected(option, selectedValue),
      })) ?? []
    );
  });

  /**
   * Maps one option (or a list of options) to its display label. If `optionLabel` is not set, the
   * original value is returned.
   */
  private mapOption(
    value: Option<T> | Option<T>[] | null | undefined,
  ): SelectResolved<T> | SelectResolved<T>[] | null | undefined {
    if (typeof value !== 'object' || !value) {
      return value;
    }
    const key = this.optionLabel();
    if (!key) {
      return value;
    }
    if (Array.isArray(value)) {
      return value.map((option) => this.getOptionProp(option, key));
    }
    return this.getOptionProp(value, key);
  }

  /**
   * Returns whether the current option is selected. Selection is delegated to `compareWith` from
   * `ng-primitives` state.
   */
  private isOptionSelected(
    currOption: Option<T>,
    selectedValue: SelectValue<T>,
  ): boolean {
    const compareWith = this.#internalState().compareWith();
    if (Array.isArray(selectedValue)) {
      return selectedValue.some((value) => compareWith(value, currOption));
    }
    return compareWith(selectedValue, currOption);
  }

  /** Safely reads a property from an option object using the configured key. */
  private getOptionProp(
    option: Option<T>,
    key: T extends object ? keyof T : never,
  ): T extends object ? T[keyof T] : never {
    return (option as Record<PropertyKey, unknown>)[
      key as PropertyKey
    ] as T extends object ? T[keyof T] : never;
  }

  /**
   * Maps emitted values for `valueChange`. If `optionValue` is configured, emits the extracted
   * property; otherwise emits the raw option.
   */
  private mapOutputValue(
    value: Option<T> | null | undefined,
  ): SelectResolved<T> | null | undefined {
    if (!isNotNil(value)) {
      return value;
    }
    const key = this.optionValue();
    if (!key || typeof value !== 'object') {
      return value;
    }
    return this.getOptionProp(value, key);
  }
}
