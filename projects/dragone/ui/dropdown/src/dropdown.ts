import { afterRenderEffect, Component, computed, contentChildren, input } from '@angular/core';
import {
  injectSelectDropdownState,
  injectSelectState,
  NgpSelectDropdown,
  provideSelectDropdownState
} from 'ng-primitives/select';

import { injectElementRef, toNativeElement } from '@dragone/ui/utils';

import { dropdownListboxId } from './dropdown-listbox-id';
import { DropdownOption } from './dropdown-option/dropdown-option';

/**
 * The floating panel of selectable options shown by a trigger (a Select field, a Button, or a
 * Link). `Dropdown` owns the panel appearance and the `listbox` ARIA wiring; placement, flip,
 * offset, and open state belong to `DropdownTrigger`.
 *
 * Declare it inside a `DropdownTrigger` element with `drgnDropdownPortal`, and project
 * `DropdownOption` rows plus an optional `DropdownSearch`:
 *
 * ```html
 * <button drgnDropdownTrigger (valueChange)="onChange($event)">
 *   Apri
 *   <drgn-dropdown *drgnDropdownPortal>
 *     <drgn-dropdown-option value="a">Opzione A</drgn-dropdown-option>
 *   </drgn-dropdown>
 * </button>
 * ```
 *
 * The options render in an inner `listbox`, labelled by the trigger. The search row and the
 * `emptyLabel` message sit beside it, since a listbox may only own options. When no option is
 * projected — typically because a search filtered them all out — `emptyLabel` is shown and
 * announced through a polite live region.
 */
@Component({
  selector: 'drgn-dropdown',
  template: `
    <ng-content select="drgn-dropdown-search" />
    <div
      class="listbox"
      role="listbox"
      [attr.id]="listboxId()"
      [attr.aria-labelledby]="triggerId()"
      [attr.aria-multiselectable]="multiple()"
      [hidden]="empty()"
    >
      <ng-content />
    </div>
    <div role="status" data-testid="dropdown-status">
      @if (empty()) {
        <div class="empty drgn-label-md-400">{{ emptyLabel() }}</div>
      }
    </div>
  `,
  styleUrl: './dropdown.css',
  providers: [provideSelectDropdownState({ inherit: false })],
  host: {
    '[attr.role]': 'null'
  },
  hostDirectives: [
    {
      directive: NgpSelectDropdown,
      inputs: ['id']
    }
  ]
})
export class Dropdown {
  /** Message shown, and announced, when the panel has no option to offer. */
  readonly emptyLabel = input('Nessun risultato');

  readonly #state = injectSelectState();

  readonly #statePanel = injectSelectDropdownState();
  private readonly options = contentChildren(DropdownOption, { descendants: true });

  protected readonly listboxId = computed(() => dropdownListboxId(this.#statePanel().id()));
  protected readonly triggerId = computed(() => this.#state().id());
  protected readonly multiple = computed(() => this.#state().multiple());
  protected readonly empty = computed(() => this.options().length === 0);

  constructor() {
    const host = toNativeElement(injectElementRef());
    // NgpSelectDropdown has to sit on the panel: it positions it, and focus moving inside it (into
    // the search field) must not close the panel. Its listbox semantics move to the inner element
    // instead, because the panel also holds the search row and the empty message. The role is
    // static, so the host binding above removes it for good; aria-multiselectable is re-written by
    // an after-render effect whenever `multiple` changes, which a host binding never sees (its own
    // value stays null), so only an effect registered after the primitive's can keep it off.
    // Upstream candidate: let the listbox be a descendant of the positioned element.
    afterRenderEffect(() => {
      this.#state().multiple();
      host.removeAttribute('aria-multiselectable');
    });
  }
}
