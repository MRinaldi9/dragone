import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCheck, faSolidMinus } from '@ng-icons/font-awesome/solid';
import { injectCheckboxState, NgpCheckbox } from 'ng-primitives/checkbox';
import { NgpFocusVisible } from 'ng-primitives/interactions';
import { ChangeFn, provideValueAccessor, TouchedFn } from 'ng-primitives/utils';

@Component({
  selector: 'drgn-checkbox',
  imports: [NgIcon],
  template: `
    @if (internalState().checked()) {
      <ng-icon name="faSolidCheck" />
    }
  `,
  styleUrl: './checkbox.css',
  providers: [provideValueAccessor(Checkbox), provideIcons({ faSolidCheck, faSolidMinus })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(blur)': 'touchedFn?.()',
  },
  hostDirectives: [
    NgpFocusVisible,
    {
      directive: NgpCheckbox,
      inputs: ['ngpCheckboxChecked: checked', 'ngpCheckboxDisabled: disabled'],
      outputs: ['ngpCheckboxCheckedChange: checkedChange'],
    },
  ],
})
export class Checkbox implements ControlValueAccessor {
  protected readonly internalState = injectCheckboxState();

  private changeFn: ChangeFn<boolean> | undefined;
  protected touchedFn: TouchedFn | undefined;

  constructor() {
    this.internalState().checkedChange.subscribe(checked => this.changeFn?.(checked));
  }

  writeValue(checked: boolean): void {
    this.internalState().checked.set(checked);
  }
  registerOnChange(fn: ChangeFn<boolean>): void {
    this.changeFn = fn;
  }
  registerOnTouched(fn: TouchedFn): void {
    this.touchedFn = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.internalState().disabled.set(isDisabled);
  }
}
