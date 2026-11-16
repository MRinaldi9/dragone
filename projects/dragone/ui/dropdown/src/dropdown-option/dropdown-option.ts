import { Component, computed } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCheck } from '@ng-icons/font-awesome/solid';
import {
  injectSelectOptionState,
  NgpSelectOption,
  provideSelectOptionState
} from 'ng-primitives/select';

import { TestId } from '@dragone/ui/utils';

/** Single selectable option row inside a `Dropdown`, displaying a check icon when selected. */
@Component({
  selector: 'drgn-dropdown-option',
  imports: [NgIcon, TestId],
  template: `
    <span class="drgn-label-md-400"><ng-content /></span>
    @if (selected()) {
      <ng-icon drgnTestId="selected-icon" name="faSolidCheck" aria-hidden="true" />
    }
  `,
  styleUrl: './dropdown-option.css',
  // NgpSelectOption never publishes its own state (unlike NgpSelect), so without this provider
  // injectSelectOptionState() throws NG0201. Upstream candidate.
  providers: [provideIcons({ faSolidCheck }), provideSelectOptionState({ inherit: false })],
  hostDirectives: [
    {
      directive: NgpSelectOption,
      inputs: ['ngpSelectOptionValue: value', 'ngpSelectOptionDisabled: disabled'],
      outputs: ['ngpSelectOptionActivated: activated']
    }
  ]
})
export class DropdownOption {
  readonly #state = injectSelectOptionState();

  protected readonly selected = computed(() => this.#state().selected());
}
