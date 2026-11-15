import { Component, DestroyRef, inject, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidMagnifyingGlass } from '@ng-icons/font-awesome/solid';
import { injectSelectState, NgpSelectInput } from 'ng-primitives/select';

import { InputGroup, InputText } from '@dragone/ui/input';
import { injectElementRef, toNativeElement } from '@dragone/ui/utils';

/**
 * Optional sticky filter row projected into `Dropdown` above the option list. Emits the typed query
 * via `queryChange` so the consumer can filter the projected `DropdownOption` items.
 */
// Owns the panel's combobox role (`NgpSelectInput`), active-descendant navigation, and focus while
// open; `NgpSelect` strips `role="combobox"` from the trigger in the meantime (ADR-0010).
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
