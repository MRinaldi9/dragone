import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { NgpFocusVisible } from 'ng-primitives/interactions';
import { injectSwitchState, NgpSwitch, NgpSwitchThumb } from 'ng-primitives/switch';
import { ChangeFn, provideValueAccessor, TouchedFn } from 'ng-primitives/utils';

@Component({
  selector: 'drgn-switch',
  imports: [NgpSwitchThumb],
  template: ` <span ngpSwitchThumb></span> `,
  styleUrl: './switch.css',
  providers: [provideValueAccessor(Switch)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'switch',
    tabindex: '0',
    '(blur)': 'touchedFn?.()',
    '(keyup.enter)': 'toggle()',
  },
  hostDirectives: [
    NgpFocusVisible,
    {
      directive: NgpSwitch,
      inputs: ['ngpSwitchChecked: checked', 'ngpSwitchDisabled: disabled'],
      outputs: ['ngpSwitchCheckedChange: checkedChange'],
    },
  ],
})
export class Switch implements ControlValueAccessor {
  private readonly internalState = injectSwitchState();
  private changeFn: ChangeFn<boolean> | undefined;
  protected touchedFn: TouchedFn | undefined;

  constructor() {
    this.internalState().checkedChange.subscribe(v => this.changeFn?.(v));
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

  protected toggle(): void {
    this.internalState().toggle();
  }
}
