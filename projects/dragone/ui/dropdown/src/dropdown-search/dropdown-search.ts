import { Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidMagnifyingGlass } from '@ng-icons/font-awesome/solid';
import { NgpFocusTrap } from 'ng-primitives/focus-trap';

import { InputGroup, InputText } from '@dragone/ui/input';

import { DropdownSearchFocus } from './dropdown-search-focus';

/**
 * Optional sticky filter row projected into `Dropdown`, which renders it above the option list. It
 * renders the search field and reports the typed text via `queryChange`; filtering the projected
 * `DropdownOption`s is the consumer's responsibility, since it depends on their option data. When
 * the filter leaves no option, `Dropdown` shows its `emptyLabel`.
 *
 * Keyboard: the field takes focus when the panel opens, and `ArrowUp`/`ArrowDown`/`Home`/`End`/
 * `Enter` keep driving the option list from here. `Escape` closes the panel and focus returns to
 * the trigger.
 */
@Component({
  selector: 'drgn-dropdown-search',
  imports: [InputGroup, InputText, NgIcon, DropdownSearchFocus],
  template: `
    <drgn-input-group>
      <input
        drgnInputText
        drgnDropdownSearchFocus
        type="search"
        [placeholder]="placeholder()"
        (input)="onInput($event)"
      />
      <ng-icon slot="trailing" name="faSolidMagnifyingGlass" aria-hidden="true" />
    </drgn-input-group>
  `,
  styleUrl: './dropdown-search.css',
  providers: [provideIcons({ faSolidMagnifyingGlass })],
  // The trap pulls focus into the row when the panel opens and keeps Tab from escaping it. It sits
  // here rather than on Dropdown because the field is the only tabbable element in the panel
  // (options use tabindex="-1"), and the panel without a search must leave focus on the trigger.
  hostDirectives: [NgpFocusTrap]
})
export class DropdownSearch {
  readonly placeholder = input('Cerca');
  readonly queryChange = output<string>();

  protected onInput(event: Event): void {
    const { value } = event.target as HTMLInputElement;
    this.queryChange.emit(value);
  }
}
