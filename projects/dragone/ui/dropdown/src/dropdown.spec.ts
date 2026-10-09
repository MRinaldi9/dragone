import { Component, computed, signal } from '@angular/core';
import { render } from '@wismaz/vitest-browser-angular';
import { page, userEvent } from 'vitest/browser';

import { Dropdown } from './dropdown';
import { DropdownOption } from './dropdown-option/dropdown-option';
import { DropdownPortal } from './dropdown-portal/dropdown-portal';
import { DropdownSearch } from './dropdown-search/dropdown-search';
import { DropdownTrigger } from './dropdown-trigger/dropdown-trigger';

@Component({
  imports: [Dropdown, DropdownOption, DropdownPortal, DropdownSearch, DropdownTrigger],
  template: `
    <button drgnDropdownTrigger [multiple]="multiple()" (valueChange)="value.set($event)">
      Trigger
      @if (value()) {
        · <span data-testid="trigger-value">{{ value() }}</span>
      }
      <drgn-dropdown *drgnDropdownPortal>
        @if (withSearch()) {
          <drgn-dropdown-search (queryChange)="query.set($event)" />
        }
        @for (option of visibleOptions(); track option.value) {
          <drgn-dropdown-option [value]="option.value" [disabled]="option.disabled">
            {{ option.label }}
          </drgn-dropdown-option>
        }
      </drgn-dropdown>
    </button>
  `
})
class TestHostComponent {
  readonly value = signal<string | undefined>(undefined);
  readonly withSearch = signal(false);
  readonly manyOptions = signal(false);
  readonly multiple = signal(false);
  readonly query = signal('');

  readonly #options = [
    { value: 'a', label: 'Opzione A', disabled: false },
    { value: 'b', label: 'Opzione B', disabled: false },
    { value: 'c', label: 'Opzione C', disabled: true }
  ];

  // A list far taller than the panel's max height, to exercise the option-list scrolling.
  readonly #manyOptions = Array.from({ length: 40 }, (_, index) => ({
    value: `opt-${index}`,
    label: `Opzione ${index + 1}`,
    disabled: false
  }));

  // Filtering is the consumer's job: DropdownSearch only emits the query.
  readonly visibleOptions = computed(() => {
    if (this.manyOptions()) {
      return this.#manyOptions;
    }
    const query = this.query().trim().toLowerCase();
    return this.#options.filter(option => option.label.toLowerCase().includes(query));
  });
}

describe(Dropdown, () => {
  it('should render the panel with the listbox role once opened', async () => {
    const { locator } = await render(TestHostComponent);
    await locator.getByRole('combobox').click();

    await expect.element(page.getByRole('listbox')).toBeInTheDocument();
  });

  it('should float the panel and keep the listbox semantics on the option list', async () => {
    const { locator } = await render(TestHostComponent);
    const trigger = locator.getByRole('combobox');
    await trigger.click();

    const listbox = page.getByRole('listbox');
    await expect.element(listbox).toHaveAttribute('aria-labelledby', trigger.element().id);

    const panel = listbox.element().closest('drgn-dropdown') as HTMLElement;
    expect(panel.hasAttribute('role')).toBeFalsy();
    expect(panel.hasAttribute('aria-multiselectable')).toBeFalsy();
    expect(getComputedStyle(panel).position).toBe('absolute');
  });

  it('should keep aria-multiselectable on the listbox when multiple changes while open', async () => {
    const { locator, componentClassInstance: component } = await render(TestHostComponent);
    await locator.getByRole('combobox').click();
    const listbox = page.getByRole('listbox');
    await expect.element(listbox).toHaveAttribute('aria-multiselectable', 'false');

    component.multiple.set(true);

    await expect.element(listbox).toHaveAttribute('aria-multiselectable', 'true');
    const panel = listbox.element().closest('drgn-dropdown') as HTMLElement;
    expect(panel.hasAttribute('aria-multiselectable')).toBeFalsy();
  });

  it('should show the empty message when there is no option', async () => {
    const { locator, componentClassInstance: component } = await render(TestHostComponent);
    component.query.set('zzz');
    await locator.getByRole('combobox').click();

    await expect.element(page.getByRole('status')).toHaveTextContent('Nessun risultato');
    await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
  });

  it('should render each projected option with the option role', async () => {
    const { locator } = await render(TestHostComponent);
    await locator.getByRole('combobox').click();

    await expect.element(page.getByRole('option', { name: 'Opzione A' })).toBeInTheDocument();
    await expect.element(page.getByRole('option', { name: 'Opzione B' })).toBeInTheDocument();
    await expect.element(page.getByRole('option', { name: 'Opzione C' })).toBeInTheDocument();
  });

  it('should cap the option list height and scroll the overflow', async () => {
    const { locator, componentClassInstance: component } = await render(TestHostComponent);
    component.manyOptions.set(true);
    await locator.getByRole('combobox').click();

    const listbox = page.getByRole('listbox');
    expect(listbox.element().clientHeight).toBeLessThanOrEqual(240);
    expect(listbox.element().scrollHeight).toBeGreaterThan(listbox.element().clientHeight);
  });

  it('should scroll the keyboard-active option into view', async () => {
    expect.hasAssertions();
    const { locator, componentClassInstance: component } = await render(TestHostComponent);
    component.manyOptions.set(true);
    const trigger = locator.getByRole('combobox');
    await trigger.click();

    // The last option sits well below the fold until End activates it.
    await userEvent.keyboard('{End}');

    const listbox = page.getByRole('listbox');
    const lastOption = page.getByRole('option', { name: 'Opzione 40' });
    await vi.waitFor(() => {
      const optionRect = lastOption.element().getBoundingClientRect();
      const listboxRect = listbox.element().getBoundingClientRect();
      expect(optionRect.bottom).toBeLessThanOrEqual(listboxRect.bottom + 1);
      expect(optionRect.top).toBeGreaterThanOrEqual(listboxRect.top - 1);
    });
  });

  it('should select an option on click', async () => {
    const { locator, componentClassInstance: component } = await render(TestHostComponent);
    const trigger = locator.getByRole('combobox');
    await trigger.click();

    await page.getByRole('option', { name: 'Opzione A' }).click();

    expect(component.value()).toBe('a');
  });

  it('should surface the selected value to the trigger', async () => {
    const { locator } = await render(TestHostComponent);
    await locator.getByRole('combobox').click();

    await page.getByRole('option', { name: 'Opzione B' }).click();

    await expect.element(locator.getByTestId('trigger-value')).toHaveTextContent('b');
  });

  it('should mark the selected option with aria-selected and the check icon', async () => {
    const { locator } = await render(TestHostComponent);
    const trigger = locator.getByRole('combobox');
    await trigger.click();
    await page.getByRole('option', { name: 'Opzione A' }).click();

    // Selecting closes the panel, so re-open it to assert the persisted selected state.
    await trigger.click();

    const optionA = page.getByRole('option', { name: 'Opzione A' });
    await expect.element(optionA).toHaveAttribute('aria-selected', 'true');
    await expect.element(page.getByTestId('selected-icon')).toBeInTheDocument();
  });

  it('should not select a disabled option on click', async () => {
    const { locator, componentClassInstance: component } = await render(TestHostComponent);
    await locator.getByRole('combobox').click();

    await page.getByRole('option', { name: 'Opzione C' }).click();

    expect(component.value()).toBeUndefined();
  });

  it('should keep focus on the trigger when there is no search field', async () => {
    const { locator } = await render(TestHostComponent);
    const trigger = locator.getByRole('combobox');
    await trigger.click();

    expect(document.activeElement).toBe(trigger.element());
  });

  describe('with a search field', () => {
    /**
     * Opens the panel and waits until the search field actually holds focus: the keyboard
     * assertions below are only meaningful once the trigger no longer receives the key events.
     */
    const openWithSearch = async () => {
      const rendered = await render(TestHostComponent);
      rendered.componentClassInstance.withSearch.set(true);
      const trigger = rendered.locator.getByRole('combobox');
      await trigger.click();

      const search = page.getByPlaceholder('Cerca');
      await expect.element(search).toBeInTheDocument();
      await vi.waitFor(() => expect(document.activeElement).toBe(search.element()));

      return { ...rendered, trigger, search };
    };

    it('should move focus into the search field when the panel opens', async () => {
      const { search } = await openWithSearch();

      expect(document.activeElement).toBe(search.element());
    });

    it('should drive the option list with the arrow keys and select with Enter', async () => {
      const { componentClassInstance: component } = await openWithSearch();

      // The panel opens with the first option active, so one ArrowDown moves to the second.
      await userEvent.keyboard('{ArrowDown}');
      await userEvent.keyboard('{Enter}');

      expect(component.value()).toBe('b');
    });

    it('should support ArrowUp, End and Home from the search field', async () => {
      const { componentClassInstance: component } = await openWithSearch();

      // Walk the list with every navigation key, landing back on the first option.
      await userEvent.keyboard('{ArrowDown}');
      await userEvent.keyboard('{ArrowUp}');
      await userEvent.keyboard('{End}');
      await userEvent.keyboard('{Home}');
      await userEvent.keyboard('{Enter}');

      expect(component.value()).toBe('a');
    });

    it('should not show the keyboard focus ring on a pointer-opened panel', async () => {
      const { search } = await openWithSearch();
      const group = search.element().closest('drgn-input-group') as HTMLElement;

      // Focus is moved into the field programmatically, so the keyboard indicator must stay off
      // while the user arrow-navigates the options.
      expect(getComputedStyle(group).boxShadow).toBe('none');
    });

    it('should still select an option by click while the search holds focus', async () => {
      const { componentClassInstance: component } = await openWithSearch();

      await page.getByRole('option', { name: 'Opzione B' }).click();

      expect(component.value()).toBe('b');
    });

    it('should not let Tab move focus out of the panel', async () => {
      const { search } = await openWithSearch();

      await userEvent.tab();

      expect(document.activeElement).toBe(search.element());
    });

    it('should keep the search field out of the listbox it controls', async () => {
      const { search } = await openWithSearch();
      const listbox = page.getByRole('listbox');

      await expect.element(search).toHaveAttribute('aria-controls', listbox.element().id);
      expect(listbox.element().contains(search.element())).toBeFalsy();
    });

    it('should announce the empty message when the query matches nothing', async () => {
      const { search } = await openWithSearch();
      const status = page.getByRole('status');
      await expect.element(status).toHaveTextContent('');

      await search.fill('zzz');
      await expect.element(status).toHaveTextContent('Nessun risultato');

      await search.fill('');
      await expect.element(status).toHaveTextContent('');
      await expect.element(page.getByRole('option', { name: 'Opzione A' })).toBeInTheDocument();
    });

    it('should narrow the options to the query and select the remaining match', async () => {
      const { componentClassInstance: component, search } = await openWithSearch();

      await search.fill('b');

      await expect.element(page.getByRole('option', { name: 'Opzione A' })).not.toBeInTheDocument();
      await expect.element(page.getByRole('option', { name: 'Opzione B' })).toBeInTheDocument();

      // Only the match is left, so ArrowDown lands on it whatever was active before filtering.
      await userEvent.keyboard('{ArrowDown}');
      await userEvent.keyboard('{Enter}');

      expect(component.value()).toBe('b');
    });

    it('should close on Escape and return focus to the trigger', async () => {
      const { trigger, search } = await openWithSearch();

      await userEvent.keyboard('{Escape}');

      await expect.element(search).not.toBeInTheDocument();
      await vi.waitFor(() => expect(document.activeElement).toBe(trigger.element()));
    });
  });

  it('should emit queryChange when typing in the search field', async () => {
    const { locator, componentClassInstance: component } = await render(TestHostComponent);
    component.withSearch.set(true);
    await locator.getByRole('combobox').click();

    await page.getByPlaceholder('Cerca').fill('Opz');

    expect(component.query()).toBe('Opz');
  });
});
