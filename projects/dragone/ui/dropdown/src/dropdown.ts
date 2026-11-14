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

import { injectElementRef, toNativeElement } from '@dragone/ui/utils';

import { DropdownOption } from './dropdown-option/dropdown-option';

/**
 * Copies the trigger's naming source onto a popup element: the label ids when the trigger is
 * labelled, its `aria-label` when named by author, the trigger id as a last resort.
 */
function mirrorName(trigger: HTMLElement, popup: HTMLElement): void {
  const labelledBy = trigger.getAttribute('aria-labelledby');
  const label = trigger.getAttribute('aria-label');
  const name = label && !labelledBy ? 'aria-label' : 'aria-labelledby';
  const value = labelledBy ?? label ?? trigger.id;
  popup.setAttribute(name, value);
  popup.removeAttribute(name === 'aria-label' ? 'aria-labelledby' : 'aria-label');
}

/**
 * The floating panel of selectable options shown by a trigger (a Select field, a Button, or a
 * Link). `Dropdown` owns the panel appearance and the `listbox` ARIA wiring; placement, flip,
 * offset, and open state belong to `DropdownTrigger`.
 *
 * Declare it inside a `DropdownTrigger` element with `drgnDropdownPortal`, and project
 * `DropdownOption` rows plus an optional `DropdownSearch`:
 *
 * ```html
 * <button drgnDropdownTrigger aria-label="Apri" (valueChange)="onChange($event)">
 *   Apri
 *   <drgn-dropdown *drgnDropdownPortal>
 *     <drgn-dropdown-option value="a">Opzione A</drgn-dropdown-option>
 *   </drgn-dropdown>
 * </button>
 * ```
 *
 * Name the trigger with `aria-label` or `aria-labelledby` (a `combobox` takes its name from the
 * author, never from its content): the popup mirrors that name on the panel and the listbox.
 *
 * The panel is a non-modal `dialog` wrapping the search row and the listbox. Without a search the
 * trigger is the combobox; with a `DropdownSearch`, the search field owns the combobox and the
 * trigger falls back to its native role while the panel is open (ADR-0010).
 *
 * The options render in an inner `listbox`. The search row and the `emptyLabel` message sit beside
 * it, since a listbox may only own options. When no option is projected — typically because a
 * search filtered them all out — `emptyLabel` is shown and announced through a polite live region.
 */
@Component({
  selector: 'drgn-dropdown',
  imports: [NgpSelectList],
  template: `
    <ng-content select="drgn-dropdown-search" />
    <div #listbox class="listbox" ngpSelectList [hidden]="empty()">
      <ng-content />
    </div>
    <div role="status" data-testid="dropdown-status">
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
