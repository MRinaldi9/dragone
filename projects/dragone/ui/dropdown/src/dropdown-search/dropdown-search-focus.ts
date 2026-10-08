import { computed, DestroyRef, Directive, inject } from '@angular/core';
import { injectSelectState } from 'ng-primitives/select';

import { injectElementRef, toNativeElement } from '@dragone/ui/utils';

import { dropdownListboxId } from '../dropdown-listbox-id';

/**
 * Private: drives the dropdown option list from the search field.
 *
 * The select key handling lives on the trigger element, which never sees these events while the
 * search field holds focus, so navigation is forwarded from here and the active option is exposed
 * to assistive technology on the focused field.
 */
@Directive({
  selector: '[drgnDropdownSearchFocus]',
  host: {
    '(keydown)': 'onKeydown($event)',
    '[attr.aria-controls]': 'listboxId()',
    '[attr.aria-activedescendant]': 'activeOptionId()'
  }
})
export class DropdownSearchFocus {
  readonly #state = injectSelectState();
  readonly #host = toNativeElement(injectElementRef());

  protected readonly listboxId = computed(() => {
    const panelId = this.#state().dropdown()?.id();
    return panelId ? dropdownListboxId(panelId) : null;
  });
  protected readonly activeOptionId = computed(
    () => this.#state().activeDescendantManager.id() ?? null
  );

  constructor() {
    // The trigger is unfocused while the panel is open, so nothing would bring focus back to it
    // when the overlay goes away (the select overlay runs with restoreFocus disabled).
    inject(DestroyRef).onDestroy(() => {
      const active = document.activeElement;
      if (!active || active === document.body || active === this.#host) {
        this.#state().focus();
      }
    });
  }

  protected onKeydown(event: KeyboardEvent): void {
    const state = this.#state();
    switch (event.key) {
      case 'ArrowDown': {
        state.activateNextOption();
        break;
      }
      case 'ArrowUp': {
        state.activatePreviousOption();
        break;
      }
      case 'Home': {
        state.activeDescendantManager.first({ origin: 'keyboard' });
        break;
      }
      case 'End': {
        state.activeDescendantManager.last({ origin: 'keyboard' });
        break;
      }
      case 'Enter': {
        const activeId = state.activeDescendantManager.id();
        state
          .sortedOptions()
          .find(option => option.id() === activeId)
          ?.select();
        break;
      }
      default: {
        return;
      }
    }
    event.preventDefault();
  }
}
