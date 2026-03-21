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
import { injectCheckboxState, NgpCheckbox } from 'ng-primitives/checkbox';
import { NgpFocusVisible } from 'ng-primitives/interactions';

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
    '(click)': 'toggle()',
    '[hidden]': 'hidden()',
    '[attr.readonly]': 'rdl() ? "" : null',
    '[attr.name]': 'name() ? name() : null',
  },
  hostDirectives: [
    NgpFocusVisible,
    {
      directive: NgpCheckbox,
      inputs: ['ngpCheckboxChecked:checked', 'ngpCheckboxDisabled:disabled'],
    },
  ],
})
export class Checkbox implements FormCheckboxControl {
  readonly #internalState = injectCheckboxState();
  readonly checked = model<boolean>(false);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly hidden = input(false, { transform: booleanAttribute });
  readonly touched = output<boolean>();
  readonly rdl = input(false, { transform: booleanAttribute, alias: 'readonly' });
  readonly name = input<string>('');

  protected toggle() {
    if (this.rdl()) {
      this.#internalState().setChecked(this.checked());
      return;
    }
    this.checked.update(v => !v);
  }
}
