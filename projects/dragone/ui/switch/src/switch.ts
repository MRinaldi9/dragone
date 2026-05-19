import { booleanAttribute, ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgpFocusVisible } from 'ng-primitives/interactions';
import { injectSwitchState, NgpSwitch, NgpSwitchThumb } from 'ng-primitives/switch';

@Component({
  selector: 'drgn-switch',
  imports: [NgpSwitchThumb],
  template: ` <span ngpSwitchThumb></span> `,
  styleUrl: './switch.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'switch',
    tabindex: '0',
    '[hidden]': 'hidden()',
    '[attr.readonly]': 'readonly() ? "" : null',
    '[attr.name]': 'name() ? name() : null',
    '(blur)': 'touch.emit()',
    '(keyup.enter)': 'toggle()',
  },
  hostDirectives: [
    NgpFocusVisible,
    {
      directive: NgpSwitch,
      inputs: ['ngpSwitchChecked: checked', 'ngpSwitchDisabled: disabled', 'id'],
      outputs: ['ngpSwitchCheckedChange: checkedChange'],
    },
  ],
})
export class Switch {
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly hidden = input(false, { transform: booleanAttribute });
  readonly name = input('');
  readonly touch = output<void>();

  readonly #internalState = injectSwitchState();

  protected toggle(): void {
    this.#internalState().toggle();
  }
}
