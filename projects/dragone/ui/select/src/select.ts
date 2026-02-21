import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCheck, faSolidChevronDown } from '@ng-icons/font-awesome/solid';
import {
  injectSelectState,
  NgpSelect,
  NgpSelectDropdown,
  NgpSelectOption,
  NgpSelectPortal,
} from 'ng-primitives/select';
import { ChangeFn, provideValueAccessor, TouchedFn, uniqueId } from 'ng-primitives/utils';
import { OptionMapperPipe } from './utils/option-mapper-pipe';
import { OptionSelectedPipe } from './utils/option-selected-pipe';

type OptionPrimitive = string | number | boolean;
type OptionObject<T> = T & { disabled?: boolean };
type Option<T> = T extends object ? OptionObject<T> : OptionPrimitive;

@Component({
  selector: 'drgn-select',
  imports: [
    NgpSelectDropdown,
    NgpSelectOption,
    NgpSelectPortal,
    NgIcon,
    OptionMapperPipe,
    OptionSelectedPipe,
  ],
  template: `
    @if (canShowValue()) {
      <span class="select-value">
        {{ internalValue() | optionMap: optionLabel() }}
      </span>
    } @else {
      <span data-testid="placeholder" class="select-placeholder">{{ placeholder() }}</span>
    }
    <ng-icon class="chevron" name="faSolidChevronDown" />
    <div *ngpSelectPortal ngpSelectDropdown>
      @for (option of options(); track option) {
        <div class="drgn-label-md-400" ngpSelectOption [ngpSelectOptionValue]="option">
          {{ option | optionMap: optionLabel() }}
          @if (option | optionSelected: internalValue()) {
            <ng-icon name="faSolidCheck" />
          }
        </div>
      } @empty {
        <div class="empty-message">Non ci sono elementi da visualizzare</div>
      }
    </div>
  `,
  styleUrl: './select.css',
  providers: [provideIcons({ faSolidChevronDown, faSolidCheck }), provideValueAccessor(Select)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'drgn-label-md-400',
    '[ariaLabel]': 'ariaLabelledBy() ? undefined : (ariaLabel() || placeholder())',
    '[attr.aria-labelledby]': 'ariaLabelledBy()',
    '(blur)': 'onTouched?.()',
  },
  hostDirectives: [
    {
      directive: NgpSelect,
      inputs: [
        'ngpSelectDisabled: disabled',
        'ngpSelectValue: value',
        'ngpSelectMultiple: multiple',
        'ngpSelectCompareWith: compareWith',
      ],
      outputs: ['ngpSelectOpenChange: openChange'],
    },
  ],
})
export class Select<T> implements ControlValueAccessor {
  readonly id = input<string>(uniqueId('drgn-select'));
  readonly options = input<Option<T>[]>();
  readonly placeholder = input<string>();
  /**
   * A string that maps an option to its display label. If not provided, the option itself will be used as the label.
   */
  readonly optionLabel = input<T extends object ? keyof T : never>();
  /** A string that maps an option to its value. If not provided, the option itself will be used as the value. */
  readonly optionValue = input<T extends object ? keyof T : never>();
  readonly ariaLabel = input<string>();
  readonly ariaLabelledBy = input<string>();
  readonly valueChange = output<Option<T> | Option<T>[]>();
  protected onChange: ChangeFn<Option<T> | Option<T>[]> | undefined;
  protected onTouched: TouchedFn | undefined;

  readonly #internalState = injectSelectState();
  protected readonly internalValue = linkedSignal<Option<T> | Option<T>[]>(
    this.#internalState().value,
  );
  protected readonly canShowValue = computed(() => {
    const isMultiple = this.#internalState().multiple();
    const value = this.internalValue();
    if (isMultiple && Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== undefined && value !== null;
  });

  constructor() {
    this.#internalState().valueChange.subscribe(value => {
      this.onChange?.(value);
      this.valueChange.emit(this.optionValue() ? value[this.optionValue()] : value);
    });
    effect(() => {
      this.#internalState().id.set(this.id());
    });
  }

  writeValue(formValue: Option<T> | Option<T>[]): void {
    this.#internalState().value.set(formValue);
  }
  registerOnChange(fn: ChangeFn<Option<T> | Option<T>[]>): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: TouchedFn): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.#internalState().disabled.set(isDisabled);
  }
}
