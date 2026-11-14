import { Component, DestroyRef, inject, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidMagnifyingGlass } from '@ng-icons/font-awesome/solid';
import { injectSelectState, NgpSelectInput } from 'ng-primitives/select';

import { InputGroup, InputText } from '@dragone/ui/input';
import { injectElementRef, toNativeElement } from '@dragone/ui/utils';

/**
 * Optional sticky filter row projected into `Dropdown`, which renders it above the option list. It
 * renders the search field and reports the typed text via `queryChange`; filtering the projected
 * `DropdownOption`s is the consumer's responsibility, since it depends on their option data. When
 * the filter leaves no option, `Dropdown` shows its `emptyLabel`.
 *
 * The field is the panel's combobox (`NgpSelectInput`): it owns the list's `aria-controls`,
 * `aria-expanded` and `aria-activedescendant`, takes focus when the panel opens, and drives the
 * options with `ArrowUp`/`ArrowDown`/`Enter`; `Home`/`End` stay with the caret. While it exists,
 * `NgpSelect` removes the combobox role from the trigger. `Escape` closes the panel and returns
 * focus to the trigger; `Tab` closes it and moves on to the next control (ADR-0010).
 */
@Component({
  selector: 'drgn-dropdown-search',
  imports: [InputGroup, InputText, NgIcon, NgpSelectInput],
  template: `
    <drgn-input-group>
      <input
        #inputText
        ngpSelectInput
        drgnInputText
        [placeholder]="placeholder()"
        (input)="queryChange.emit(inputText.host.value)"
      />
      <ng-icon slot="trailing" name="faSolidMagnifyingGlass" aria-hidden="true" />
    </drgn-input-group>
  `,
  styleUrl: './dropdown-search.css',
  providers: [provideIcons({ faSolidMagnifyingGlass })]
})
export class DropdownSearch {
  readonly placeholder = input('Cerca');
  readonly queryChange = output<string>();

  readonly #state = injectSelectState();

  constructor() {
    const host = toNativeElement(injectElementRef());
    // The overlay closes on Escape from a document capture listener while this field holds focus,
    // and it runs with restoreFocus disabled: without this the panel would be destroyed with focus
    // on the body. A Tab that already moved focus elsewhere must not be pulled back.
    inject(DestroyRef).onDestroy(() => {
      const active = document.activeElement;
      if (!active || active === document.body || active === host) {
        this.#state().focus();
      }
    });
  }
}
