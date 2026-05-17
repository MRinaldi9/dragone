import { booleanAttribute, ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCheck, faSolidMinus } from '@ng-icons/font-awesome/solid';
import { injectCheckboxState, NgpCheckbox } from 'ng-primitives/checkbox';
import { NgpFocusVisible } from 'ng-primitives/interactions';

@Component({
  selector: 'drgn-checkbox',
  imports: [NgIcon],
  template: `
    @if (_checked()) {
      <ng-icon name="faSolidCheck" />
    }
  `,
  styleUrl: './checkbox.css',
  providers: [provideIcons({ faSolidCheck, faSolidMinus })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[hidden]': 'hidden()',
    '[attr.name]': 'name() ? name() : null',
    '[attr.readonly]': 'readonly() ? "" : null',
    '(blur)': 'touch.emit()',
  },
  hostDirectives: [
    NgpFocusVisible,
    {
      directive: NgpCheckbox,
      inputs: ['ngpCheckboxChecked:checked', 'ngpCheckboxDisabled:disabled', 'id'],
      outputs: ['ngpCheckboxCheckedChange:checkedChange'],
    },
  ],
})
export class Checkbox {
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly hidden = input(false, { transform: booleanAttribute });
  readonly name = input<string>('');
  readonly touch = output<void>();
  readonly #checkboxState = injectCheckboxState();

  protected readonly _checked = this.#checkboxState().checked;

  reset?(): void {
    throw new Error('Method not implemented.');
  }
}
