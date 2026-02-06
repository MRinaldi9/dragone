import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { injectRadioGroupState, NgpRadioGroup } from 'ng-primitives/radio';
import { ChangeFn, provideValueAccessor, TouchedFn } from 'ng-primitives/utils';

@Component({
  selector: 'drgn-radio-group',
  imports: [],
  template: `
    <ng-content />
  `,
  styleUrl: './radio-group.css',
  providers: [provideValueAccessor(RadioGroup)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(blur)': 'onTouched?.()',
    '[style.--direction]': 'direction()',
  },
  hostDirectives: [
    {
      directive: NgpRadioGroup,
      inputs: [
        'ngpRadioGroupValue:value',
        'ngpRadioGroupDisabled:disabled',
        'ngpRadioGroupOrientation:orientation',
        'ngpRadioGroupCompareWith:compare',
      ],
      outputs: ['ngpRadioGroupValueChange:valueChange'],
    },
  ],
})
export class RadioGroup<T> implements ControlValueAccessor {
  private readonly radioGroupState = injectRadioGroupState<T>();
  protected direction = computed(() =>
    this.radioGroupState().orientation() === 'horizontal' ? 'row' : 'column',
  );
  protected onTouched: TouchedFn | undefined;
  private onChange: ChangeFn<T | null> | undefined;

  constructor() {
    this.radioGroupState().valueChange.subscribe(value => this.onChange?.(value));
  }

  writeValue(val: T): void {
    this.radioGroupState().value.set(val);
  }
  registerOnChange(fn: ChangeFn<T | null>): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: TouchedFn): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.radioGroupState().disabled.set(isDisabled);
  }
}
