import {
  booleanAttribute,
  Component,
  computed,
  input,
  model,
  output,
  signal,
  viewChild,
  viewChildren,
  type ElementRef
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidMagnifyingGlass, faSolidXmark } from '@ng-icons/font-awesome/solid';
import { activeDescendantManager } from 'ng-primitives/a11y';
import { injectFormFieldState } from 'ng-primitives/form-field';
import { NgpInput } from 'ng-primitives/input';
import { NgpFocusVisible } from 'ng-primitives/interactions';
import { injectSearchState, NgpSearch, NgpSearchClear } from 'ng-primitives/search';
import { uniqueId } from 'ng-primitives/utils';

import { Button } from '@dragone/ui/button';
import { injectElementRef } from '@dragone/ui/utils';

/**
 * A search field that submits a query and, when given `suggestions`, filters them into an
 * autocomplete listbox the user can navigate with the arrow keys.
 *
 * Use it standalone or inside a `drgn-field` to inherit the field label, description and errors.
 */
@Component({
  selector: 'drgn-searchbar',
  imports: [Button, NgIcon, NgpInput, NgpFocusVisible, NgpSearchClear],
  templateUrl: './searchbar.html',
  styleUrl: './searchbar.css',
  providers: [provideIcons({ faSolidMagnifyingGlass, faSolidXmark })],
  host: {
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '[attr.data-readonly]': 'readonly() ? "" : null',
    '[attr.data-invalid]': 'invalid() ? "" : null',
    '[attr.data-open]': 'isOpen() ? "" : null',
    '[attr.hidden]': 'hidden() ? "" : null',
    '(focusout)': 'onFocusOut($event)'
  },
  hostDirectives: [NgpSearch]
})
export class Searchbar implements FormValueControl<string> {
  /** The search query. Two-way bound, so `[(value)]` keeps a consumer signal in sync. */
  readonly value = model<string>('');
  /**
   * The id of the native input, referenced by an associated field label.
   *
   * @default a unique `drgn-searchbar-input-*` id
   */
  readonly inputId = input<string>(uniqueId('drgn-searchbar-input'));
  /**
   * The placeholder shown while the query is empty.
   *
   * @default 'Text'
   */
  readonly placeholder = input<string>('Text');
  /**
   * The label of the submit button, used as fallback accessible name of the input.
   *
   * @default 'Ricerca'
   */
  readonly searchLabel = input<string>('Ricerca');
  /**
   * The accessible name of the input when it is not associated with a field label.
   *
   * @default the `searchLabel` value
   */
  readonly ariaLabel = input<string>();
  /**
   * The accessible name of the clear button.
   *
   * @default 'Cancella testo'
   */
  readonly clearInputAriaLabel = input<string>('Cancella testo');
  /**
   * The autocomplete suggestions. A non-empty list switches the input to combobox semantics and
   * opens the listbox on focus.
   *
   * @default [ ]
   */
  readonly suggestions = input<readonly string[]>([]);
  /**
   * Whether the field is disabled.
   *
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * Whether the query can be read but not edited.
   *
   * @default false
   */
  readonly readonly = input(false, { transform: booleanAttribute });
  /**
   * Whether the field is hidden.
   *
   * @default false
   */
  readonly hidden = input(false, { transform: booleanAttribute });
  /**
   * Whether the field displays the invalid state.
   *
   * @default false
   */
  readonly invalid = input(false, { transform: booleanAttribute });
  /**
   * The touched status of the field, kept in sync by a parent form.
   *
   * @default false
   */
  readonly touched = input(false, { transform: booleanAttribute });
  /**
   * Whether the query is required.
   *
   * @default false
   */
  readonly required = input(false, { transform: booleanAttribute });
  /**
   * The name of the control, submitted with a form.
   *
   * @default ''
   */
  readonly name = input<string>('');
  /** Emits when the focus leaves the component. */
  readonly touch = output<void>();
  /** Emits the query when the user submits the search. */
  readonly searchSubmit = output<string>();
  /** Emits when the query is cleared. */
  readonly clearValue = output<void>();
  /** Emits the suggestion the user selects. */
  readonly suggestionSelected = output<string>();

  readonly #host = injectElementRef<HTMLElement>();
  private readonly inputElement = viewChild<ElementRef<HTMLInputElement>>('input');
  private readonly optionElements = viewChildren<ElementRef<HTMLElement>>('option');
  readonly #searchState = injectSearchState();
  readonly #formFieldState = injectFormFieldState({ optional: true });
  // `activeDescendantManager` starts at index 0; the popup must open with no option pre-activated.
  readonly #activeDescendant = activeDescendantManager({
    count: computed(() => this.filteredSuggestions().length),
    getItemId: index => this.optionId(index),
    isItemDisabled: () => false,
    scrollIntoView: index =>
      this.optionElements()[index]?.nativeElement.scrollIntoView({ block: 'nearest' })
  });

  protected readonly hasSuggestions = computed(() => this.suggestions().length > 0);
  protected readonly filteredSuggestions = computed(() => {
    const query = this.value().trim().toLowerCase();
    const suggestions = this.suggestions();
    return query ? suggestions.filter(item => item.toLowerCase().includes(query)) : suggestions;
  });
  protected readonly panelOpen = signal(false);
  protected readonly isOpen = computed(
    () =>
      !this.disabled() &&
      !this.readonly() &&
      this.panelOpen() &&
      this.filteredSuggestions().length > 0
  );
  protected readonly empty = computed(() => this.value().length === 0);
  protected readonly activeIndex = computed(() => this.#activeDescendant.index());
  protected readonly activeDescendantId = computed(() => this.#activeDescendant.id());
  protected readonly listboxId = computed(() => `${this.inputId()}-listbox`);
  protected readonly fieldLabelledBy = computed(() => {
    const labels = this.#formFieldState()?.labels() ?? [];
    return labels.length > 0 ? labels.join(' ') : null;
  });
  protected readonly inputAriaLabel = computed(() =>
    this.fieldLabelledBy() ? null : this.ariaLabel() || this.searchLabel()
  );

  constructor() {
    this.#activeDescendant.reset();
  }

  /** Moves the focus to the native input. */
  focus(options?: FocusOptions): void {
    this.inputElement()?.nativeElement.focus(options);
  }

  protected optionId(index: number): string {
    return `${this.listboxId()}-option-${index}`;
  }

  protected onFocus(): void {
    if (this.hasSuggestions() && !this.disabled() && !this.readonly()) {
      this.#openPanel();
    }
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (next instanceof Node && this.#host.nativeElement.contains(next)) {
      return;
    }
    this.#closePanel();
    this.touch.emit();
  }

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
    if (this.hasSuggestions()) {
      this.#openPanel();
    }
  }

  protected onClear(): void {
    this.#clearQuery();
    this.focus();
  }

  protected onSubmit(): void {
    this.#closePanel();
    this.searchSubmit.emit(this.value());
  }

  protected onEscape(event: Event): void {
    if (this.isOpen()) {
      event.preventDefault();
      event.stopPropagation();
      this.#closePanel();
      return;
    }
    if (this.disabled() || this.readonly() || this.value().length === 0) {
      return;
    }
    event.preventDefault();
    this.#clearQuery();
  }

  protected onArrowDown(event: Event): void {
    this.#moveActiveOption(event, true);
  }

  protected onArrowUp(event: Event): void {
    this.#moveActiveOption(event, false);
  }

  protected onEnter(event: Event): void {
    event.preventDefault();
    if (this.isOpen() && this.#activeDescendant.index() >= 0) {
      this.selectSuggestion(this.filteredSuggestions()[this.#activeDescendant.index()]);
      return;
    }
    this.#closePanel();
    this.searchSubmit.emit(this.value());
  }

  protected onOptionPointerEnter(index: number): void {
    this.#activeDescendant.activateByIndex(index, { origin: 'pointer' });
  }

  protected onOptionPointerLeave(index: number): void {
    if (this.#activeDescendant.index() === index) {
      this.#activeDescendant.reset();
    }
  }

  protected selectSuggestion(suggestion: string): void {
    this.value.set(suggestion);
    this.#closePanel();
    this.suggestionSelected.emit(suggestion);
  }

  #moveActiveOption(event: Event, forward: boolean): void {
    if (
      this.disabled() ||
      this.readonly() ||
      !this.hasSuggestions() ||
      this.filteredSuggestions().length === 0
    ) {
      return;
    }

    event.preventDefault();

    if (!this.isOpen() || this.#activeDescendant.index() === -1) {
      this.#openPanel();
      this.#activateEdge(forward);
      return;
    }

    if (forward) {
      this.#activeDescendant.next({ origin: 'keyboard' });
      return;
    }
    this.#activeDescendant.previous({ origin: 'keyboard' });
  }

  #clearQuery(): void {
    this.#searchState().clear();
    this.value.set('');
    this.#closePanel();
    this.clearValue.emit();
  }

  #activateEdge(forward: boolean): void {
    if (forward) {
      this.#activeDescendant.first({ origin: 'keyboard' });
      return;
    }
    this.#activeDescendant.last({ origin: 'keyboard' });
  }

  #openPanel(): void {
    this.panelOpen.set(true);
    this.#activeDescendant.reset();
  }

  #closePanel(): void {
    this.panelOpen.set(false);
    this.#activeDescendant.reset();
  }
}
