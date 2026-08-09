import { booleanAttribute, Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCheck } from '@ng-icons/font-awesome/solid';
import { NgpFocusVisible } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { injectToggleState, NgpToggle } from 'ng-primitives/toggle';

import { toElement } from '@dragone/ui/utils';

@Component({
  selector: 'button[drgn-chip-selected], button[drgnChipSelected]',
  imports: [NgIcon],
  template: `
    <ng-icon class="chip-icon" size="1rem" name="faSolidCheck" />
    <ng-content />
  `,
  styleUrl: './chip-selected.css',
  providers: [provideIcons({ faSolidCheck })],
  host: {
    class: 'drgn-label-md-700',
    '[attr.data-hidden]': 'hidden() ? "" : null',
    '[attr.name]': 'name()',
    '(blur)': 'touch.emit()',
  },
  hostDirectives: [
    {
      directive: NgpToggle,
      inputs: ['ngpToggleSelected: checked', 'ngpToggleDisabled: disabled'],
      outputs: ['ngpToggleSelectedChange: checkedChange'],
    },
    NgpFocusVisible,
  ],
})
export class ChipSelected {
  readonly hidden = input(false, { transform: booleanAttribute });
  readonly name = input<string>();
  readonly touch = output();

  protected readonly state = injectToggleState();
  readonly #element = toElement(injectElementRef());

  focus(options?: FocusOptions): void {
    this.#element?.focus(options);
  }
}
