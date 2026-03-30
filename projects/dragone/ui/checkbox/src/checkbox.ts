import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
} from '@angular/core';
import { type FormCheckboxControl } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCheck, faSolidMinus } from '@ng-icons/font-awesome/solid';
import { ngpCheckbox, NgpCheckbox } from 'ng-primitives/checkbox';
import { NgpFocusVisible } from 'ng-primitives/interactions';
import { uniqueId } from 'ng-primitives/utils';

@Component({
  selector: 'drgn-checkbox',
  imports: [NgIcon],
  template: `
    @if (checked()) {
      <ng-icon name="faSolidCheck" />
    }
  `,
  styleUrl: './checkbox.css',
  providers: [provideIcons({ faSolidCheck, faSolidMinus })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(blur)': 'touched.emit(true)',
    '[hidden]': 'hidden()',
    '[attr.name]': 'name() ? name() : null',
  },
  hostDirectives: [NgpFocusVisible, NgpCheckbox],
})
export class Checkbox implements FormCheckboxControl {
  readonly id = input(uniqueId('drgn-checkbox'));
  readonly checked = model<boolean>(false);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly hidden = input(false, { transform: booleanAttribute });
  readonly touched = output<boolean>();
  readonly name = input<string>('');

  constructor() {
    ngpCheckbox({
      checked: this.checked,
      disabled: this.disabled,
      id: this.id,
      onCheckedChange: v => this.checked.set(v),
    });
  }
}
