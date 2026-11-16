import {
  afterRenderEffect,
  Component,
  computed,
  contentChildren,
  type ElementRef,
  input,
  viewChild
} from '@angular/core';
import { injectSelectState, NgpSelectDropdown, NgpSelectList } from 'ng-primitives/select';

import { injectElementRef, TestId, toNativeElement } from '@dragone/ui/utils';

import { DropdownOption } from './dropdown-option/dropdown-option';

// Copies the trigger's accessible naming source (`aria-labelledby`, `aria-label`, or `id`) onto the popup.
function mirrorName(trigger: HTMLElement, popup: HTMLElement): void {
  const labelledBy = trigger.getAttribute('aria-labelledby');
  const label = trigger.getAttribute('aria-label');
  const name = label && !labelledBy ? 'aria-label' : 'aria-labelledby';
  const value = labelledBy ?? label ?? trigger.id;
  popup.setAttribute(name, value);
  popup.removeAttribute(name === 'aria-label' ? 'aria-labelledby' : 'aria-label');
}

/**
 * Floating panel of selectable options opened by a `DropdownTrigger` and portaled via
 * `*drgnDropdownPortal`. Project `DropdownOption` items and an optional `DropdownSearch` inside it,
 * and name the trigger with `aria-label` or `aria-labelledby`:
 *
 * ```html
 * <button drgnDropdownTrigger aria-label="Apri" (valueChange)="onChange($event)">
 *   Apri
 *   <drgn-dropdown *drgnDropdownPortal>
 *     <drgn-dropdown-option value="a">Opzione A</drgn-dropdown-option>
 *   </drgn-dropdown>
 * </button>
 * ```
 */
@Component({
  selector: 'drgn-dropdown',
  imports: [NgpSelectList, TestId],
  template: `
    <ng-content select="drgn-dropdown-search" />
    <div #listbox class="listbox" ngpSelectList [hidden]="empty()">
      <ng-content />
    </div>
    <div role="status" drgnTestId="dropdown-status">
      @if (empty()) {
        <div class="empty drgn-label-md-400">{{ emptyLabel() }}</div>
      }
    </div>
  `,
  styleUrl: './dropdown.css',
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
  protected readonly listbox = viewChild.required<ElementRef<HTMLElement>>('listbox');
  private readonly options = contentChildren(DropdownOption, { descendants: true });

  protected readonly empty = computed(() => this.options().length === 0);

  constructor() {
    const host = toNativeElement(injectElementRef());
    // NgpSelectDropdown has to sit on the panel: it positions it, and focus moving inside it (into
    // the search field) must not close the panel. Its listbox semantics land on the inner
    // NgpSelectList instead, because the panel also holds the search row and the empty message:
    // with a list registered the panel renders as a non-modal `dialog` wrapping both.
    //
    // The naming runs after render, not as a host binding: it mirrors attributes the trigger
    // receives through its own host bindings, which no computed can observe. Never name the popup
    // `aria-labelledby="<trigger id>"` — a `combobox` supports name from author only, so accname
    // resolves its reference to nothing.
    afterRenderEffect(() => {
      const trigger = this.#state().elementRef.nativeElement as HTMLElement;
      mirrorName(trigger, host);
      mirrorName(trigger, this.listbox().nativeElement);
    });
  }
}
