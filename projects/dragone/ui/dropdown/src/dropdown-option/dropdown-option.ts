import { Component, computed } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCheck } from '@ng-icons/font-awesome/solid';
import {
  injectSelectOptionState,
  NgpSelectOption,
  provideSelectOptionState
} from 'ng-primitives/select';

/**
 * A single row inside `Dropdown`. Renders the `faSolidCheck` icon when selected. Hover, pressed,
 * and disabled visuals come from `NgpSelectOption`'s built-in interaction tracking; the
 * keyboard-active ("Focus" in the Sirio spec) look is driven by `[data-active]`, since listbox
 * options never receive real DOM focus: it stays on the trigger or the search field, which point at
 * the active option through `aria-activedescendant`.
 */
@Component({
  selector: 'drgn-dropdown-option',
  imports: [NgIcon],
  template: `
    <span class="drgn-label-md-400"><ng-content /></span>
    @if (selected()) {
      <ng-icon data-testid="selected-icon" name="faSolidCheck" aria-hidden="true" />
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
