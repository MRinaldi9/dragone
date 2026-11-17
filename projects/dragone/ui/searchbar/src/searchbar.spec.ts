import { Component, output, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { render } from '@wismaz/vitest-browser-angular';
import { page, userEvent, type Locator } from 'vitest/browser';

import { Field } from '@dragone/ui/field';

import { Searchbar } from './searchbar';

const suggestionList = ['Relazionale', 'Relazione', 'Relazioni', 'Relazioni industriali'];

@Component({
  imports: [Searchbar],
  template: `
    <drgn-searchbar
      [value]="value()"
      [searchLabel]="searchLabel()"
      [ariaLabel]="ariaLabel()"
      [clearInputAriaLabel]="clearInputAriaLabel()"
      [suggestions]="suggestions()"
      (valueChange)="value.set($event); valueChange.emit($event)"
      (touch)="touch.emit()"
      (searchSubmit)="searchSubmit.emit($event)"
      (clearValue)="clearValue.emit()"
      (suggestionSelected)="suggestionSelected.emit($event)"
    />
    <button data-testid="outside">Fuori</button>
  `
})
class SearchbarHost {
  readonly value = signal('');
  readonly searchLabel = signal('Ricerca');
  readonly ariaLabel = signal<string | undefined>(undefined);
  readonly clearInputAriaLabel = signal('Cancella testo');
  readonly suggestions = signal<readonly string[]>([]);
  readonly valueChange = output<string>();
  readonly touch = output<void>();
  readonly searchSubmit = output<string>();
  readonly clearValue = output<void>();
  readonly suggestionSelected = output<string>();
}

@Component({
  imports: [Field, FormField, Searchbar],
  template: `
    <drgn-field label="Cerca" description="Inserisci testo">
      <drgn-searchbar [formField]="form.query" />
    </drgn-field>
    <button data-testid="outside">Fuori</button>
  `
})
class FieldFormHost {
  readonly form = form(signal({ query: '' }), schema => {
    required(schema.query, { message: 'Campo obbligatorio' });
  });
}

const option = (name: string) => page.getByRole('option', { name });

const createSpies = () => ({
  valueChange: vi.fn<(value: string) => void>(),
  searchSubmit: vi.fn<(value: string) => void>(),
  clearValue: vi.fn<() => void>(),
  suggestionSelected: vi.fn<(value: string) => void>(),
  touch: vi.fn<() => void>()
});

const renderSearchbar = async () => {
  const spies = createSpies();
  const result = await render(SearchbarHost, { outputs: spies });
  return { ...result, spies };
};

// Tabs forward until the focus lands outside the searchbar, whatever its inner tab stops are.
const tabOut = async (outside: Locator): Promise<void> => {
  for (let step = 0; step < 6; step += 1) {
    if (document.activeElement === outside.element()) {
      return;
    }
    await userEvent.keyboard('{Tab}');
  }
};

describe(Searchbar, () => {
  describe('host state', () => {
    it('marks the host data-empty while the query is empty and drops the mark when valued', async () => {
      const { locator } = await render(Searchbar);
      await expect.element(locator).toHaveAttribute('data-empty');

      await locator.getByRole('searchbox').fill('Pensione');

      await expect.element(locator).not.toHaveAttribute('data-empty');
    });

    it('marks the host data-disabled', async () => {
      const { locator } = await render(Searchbar, { inputs: { disabled: true } });

      await expect.element(locator).toHaveAttribute('data-disabled');
    });

    it('marks the host data-readonly', async () => {
      const { locator } = await render(Searchbar, { inputs: { readonly: true } });

      await expect.element(locator).toHaveAttribute('data-readonly');
    });

    it('marks the host data-invalid', async () => {
      const { locator } = await render(Searchbar, { inputs: { invalid: true } });

      await expect.element(locator).toHaveAttribute('data-invalid');
    });

    it('applies the hidden attribute to the host', async () => {
      const { locator } = await render(Searchbar, { inputs: { hidden: true } });

      await expect.element(locator).toHaveAttribute('hidden');
    });
  });

  describe('standard searchbar', () => {
    it('renders the contract defaults: empty query, Text placeholder and Ricerca labels', async () => {
      const { locator } = await render(Searchbar);
      const searchbox = locator.getByRole('searchbox');

      await expect.element(searchbox).toHaveValue('');
      await expect.element(searchbox).toHaveAttribute('placeholder', 'Text');
      await expect.element(searchbox).toHaveAttribute('aria-label', 'Ricerca');
      await expect.element(locator.getByRole('button', { name: 'Ricerca' })).toBeInTheDocument();
      await expect
        .element(locator.getByRole('button', { name: 'Cancella testo' }))
        .not.toBeInTheDocument();
    });

    it('exposes a searchbox without combobox semantics', async () => {
      const { locator } = await renderSearchbar();

      const searchbox = locator.getByRole('searchbox');
      await expect.element(searchbox).toBeInTheDocument();
      await expect.element(locator.getByRole('combobox')).not.toBeInTheDocument();
      await expect.element(searchbox).not.toHaveAttribute('aria-expanded');
    });

    it('shows the clear button only when the query is valued', async () => {
      const { locator, componentClassInstance: host } = await renderSearchbar();
      const clearButton = locator.getByRole('button', { name: 'Cancella testo' });

      await expect.element(clearButton).not.toBeInTheDocument();

      host.value.set('Pensione');

      await expect.element(clearButton).toBeVisible();
    });

    it('clears the query when the clear button is clicked, keeping the focus on the input', async () => {
      const { locator, componentClassInstance: host, spies } = await renderSearchbar();
      host.value.set('Pensione');
      const searchbox = locator.getByRole('searchbox');

      await locator.getByRole('button', { name: 'Cancella testo' }).click();

      await expect.element(searchbox).toHaveValue('');
      expect(spies.valueChange).toHaveBeenCalledWith('');
      expect(spies.clearValue).toHaveBeenCalledOnce();
      expect(host.value()).toBe('');
      await expect.element(searchbox).toHaveFocus();
    });

    it('clears the query when Escape is pressed on a valued input', async () => {
      const { locator, componentClassInstance: host, spies } = await renderSearchbar();
      host.value.set('Pensione');
      const searchbox = locator.getByRole('searchbox');
      await searchbox.click();

      await userEvent.keyboard('{Escape}');

      await expect.element(searchbox).toHaveValue('');
      expect(spies.valueChange).toHaveBeenCalledWith('');
      expect(spies.clearValue).toHaveBeenCalledOnce();
      await expect.element(searchbox).toHaveFocus();
    });

    it('emits searchSubmit with the current query when the submit button is clicked', async () => {
      const { locator, componentClassInstance: host, spies } = await renderSearchbar();
      host.value.set('Pensione');

      await locator.getByRole('button', { name: 'Ricerca' }).click();

      expect(spies.searchSubmit).toHaveBeenCalledWith('Pensione');
    });

    it('emits searchSubmit with the current query when Enter is pressed', async () => {
      const { locator, spies } = await renderSearchbar();
      await locator.getByRole('searchbox').fill('Pensione');

      await userEvent.keyboard('{Enter}');

      expect(spies.searchSubmit).toHaveBeenCalledWith('Pensione');
    });

    it('applies the custom inputId and placeholder to the input', async () => {
      const { locator } = await render(Searchbar, {
        inputs: { inputId: 'drgn-searchbar-ricerca', placeholder: 'Cerca una notizia' }
      });
      const searchbox = locator.getByRole('searchbox');

      await expect.element(searchbox).toHaveAttribute('id', 'drgn-searchbar-ricerca');
      await expect.element(searchbox).toHaveAttribute('placeholder', 'Cerca una notizia');
    });

    it('applies required and name to the input when set', async () => {
      const { locator } = await render(Searchbar, { inputs: { name: 'q', required: true } });
      const searchbox = locator.getByRole('searchbox');

      await expect.element(searchbox).toHaveAttribute('required');
      await expect.element(searchbox).toHaveAttribute('name', 'q');
    });

    it('does not expose required or name on the input by default', async () => {
      const { locator } = await render(Searchbar);
      const searchbox = locator.getByRole('searchbox');

      await expect.element(searchbox).not.toHaveAttribute('required');
      await expect.element(searchbox).not.toHaveAttribute('name');
    });

    it('uses ariaLabel as the input aria-label when provided', async () => {
      const { locator, componentClassInstance: host } = await renderSearchbar();
      host.ariaLabel.set('Cerca nel portale');

      await expect
        .element(locator.getByRole('searchbox'))
        .toHaveAttribute('aria-label', 'Cerca nel portale');
    });

    it('falls back to searchLabel as the input aria-label', async () => {
      const { locator, componentClassInstance: host } = await renderSearchbar();
      host.searchLabel.set('Cerca nel portale');

      await expect
        .element(locator.getByRole('searchbox'))
        .toHaveAttribute('aria-label', 'Cerca nel portale');
    });

    it('names the submit button after searchLabel and the clear button after clearInputAriaLabel', async () => {
      const { locator, componentClassInstance: host } = await renderSearchbar();
      host.searchLabel.set('Cerca nel portale');
      host.clearInputAriaLabel.set('Cancella ricerche');
      host.value.set('Pensione');

      await expect
        .element(locator.getByRole('button', { name: 'Cerca nel portale' }))
        .toBeInTheDocument();
      await expect
        .element(locator.getByRole('button', { name: 'Cancella ricerche' }))
        .toBeInTheDocument();
    });

    it('moves the focus to the input via focus()', async () => {
      const { locator, componentClassInstance } = await render(Searchbar);

      componentClassInstance.focus({ preventScroll: true });

      await expect.element(locator.getByRole('searchbox')).toHaveFocus();
    });

    it('emits touch only when the focus leaves the component', async () => {
      const { locator, spies } = await renderSearchbar();
      const searchbox = locator.getByRole('searchbox');
      await searchbox.click();

      await locator.getByRole('button', { name: 'Ricerca' }).click();
      expect(spies.touch).not.toHaveBeenCalled();

      await locator.getByTestId('outside').click();
      expect(spies.touch).toHaveBeenCalledOnce();
    });
  });

  describe('autocomplete searchbar', () => {
    it('exposes combobox semantics on the input while closed', async () => {
      const { locator, componentClassInstance: host } = await renderSearchbar();
      host.suggestions.set(suggestionList);

      const combobox = locator.getByRole('combobox');
      await expect.element(combobox).toBeInTheDocument();
      await expect.element(combobox).toHaveAttribute('aria-autocomplete', 'list');
      await expect.element(combobox).toHaveAttribute('aria-haspopup', 'listbox');
      await expect.element(combobox).toHaveAttribute('aria-expanded', 'false');
      await expect.element(locator.getByRole('searchbox')).not.toBeInTheDocument();
    });

    it('opens the popup with every suggestion on focus and pre-activates no option', async () => {
      const { locator, componentClassInstance: host } = await renderSearchbar();
      host.suggestions.set(suggestionList);

      const combobox = locator.getByRole('combobox');
      await combobox.click();

      await expect.element(page.getByRole('listbox')).toBeInTheDocument();
      for (const name of suggestionList) {
        await expect.element(option(name)).toBeInTheDocument();
      }
      await expect.element(combobox).toHaveAttribute('aria-expanded', 'true');
      await expect.element(combobox).not.toHaveAttribute('aria-activedescendant');
    });

    it('filters the suggestions on the trimmed query, case-insensitively', async () => {
      const { locator, componentClassInstance: host } = await renderSearchbar();
      host.suggestions.set(suggestionList);
      const combobox = locator.getByRole('combobox');

      await combobox.fill('relazion');
      for (const name of suggestionList) {
        await expect.element(option(name)).toBeInTheDocument();
      }

      await combobox.fill(' RELAZIONE ');
      await expect.element(option('Relazione')).toBeInTheDocument();
      for (const name of ['Relazionale', 'Relazioni', 'Relazioni industriali']) {
        await expect.element(option(name)).not.toBeInTheDocument();
      }
    });

    it('submits the typed query on Enter when no option is active', async () => {
      const { locator, componentClassInstance: host, spies } = await renderSearchbar();
      host.suggestions.set(suggestionList);
      const combobox = locator.getByRole('combobox');
      await combobox.fill('Relazione');
      await expect.element(combobox).not.toHaveAttribute('aria-activedescendant');

      await userEvent.keyboard('{Enter}');

      expect(spies.searchSubmit).toHaveBeenCalledWith('Relazione');
      expect(spies.suggestionSelected).not.toHaveBeenCalled();
      await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
    });

    it('moves the active option through the suggestions with ArrowDown and ArrowUp', async () => {
      const { locator, componentClassInstance: host } = await renderSearchbar();
      host.suggestions.set(suggestionList);
      const combobox = locator.getByRole('combobox');
      await combobox.click();

      await userEvent.keyboard('{ArrowDown}');
      const first = option('Relazionale');
      await expect.element(first).toHaveAttribute('data-active');
      await expect.element(first).toHaveAttribute('aria-selected', 'true');
      await expect.element(combobox).toHaveAttribute('aria-activedescendant', first.element().id);

      await userEvent.keyboard('{ArrowDown}');
      const second = option('Relazione');
      await expect.element(second).toHaveAttribute('data-active');
      await expect.element(second).toHaveAttribute('aria-selected', 'true');
      await expect.element(combobox).toHaveAttribute('aria-activedescendant', second.element().id);
      await expect.element(first).not.toHaveAttribute('data-active');

      await userEvent.keyboard('{ArrowUp}');
      await expect.element(first).toHaveAttribute('data-active');
      await expect.element(combobox).toHaveAttribute('aria-activedescendant', first.element().id);
    });

    it('selects the active option on Enter and closes the popup', async () => {
      const { locator, componentClassInstance: host, spies } = await renderSearchbar();
      host.suggestions.set(suggestionList);
      const combobox = locator.getByRole('combobox');
      await combobox.click();
      await userEvent.keyboard('{ArrowDown}');

      await userEvent.keyboard('{Enter}');

      await expect.element(combobox).toHaveValue('Relazionale');
      expect(spies.suggestionSelected).toHaveBeenCalledWith('Relazionale');
      expect(spies.searchSubmit).not.toHaveBeenCalled();
      await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
    });

    it('selects an option on click and closes the popup', async () => {
      const { locator, componentClassInstance: host, spies } = await renderSearchbar();
      host.suggestions.set(suggestionList);
      const combobox = locator.getByRole('combobox');
      await combobox.click();

      await option('Relazione').click();

      await expect.element(combobox).toHaveValue('Relazione');
      expect(spies.suggestionSelected).toHaveBeenCalledWith('Relazione');
      await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
    });

    it('keeps the query on the first Escape and clears it on the second', async () => {
      const { locator, componentClassInstance: host, spies } = await renderSearchbar();
      host.suggestions.set(suggestionList);
      const combobox = locator.getByRole('combobox');
      await combobox.fill('Relazione');

      await userEvent.keyboard('{Escape}');
      await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
      await expect.element(combobox).toHaveValue('Relazione');
      expect(spies.clearValue).not.toHaveBeenCalled();

      await userEvent.keyboard('{Escape}');
      await expect.element(combobox).toHaveValue('');
      expect(spies.clearValue).toHaveBeenCalledOnce();
    });

    it('reflects the popup state on the host data-open attribute', async () => {
      const { locator } = await render(Searchbar, { inputs: { suggestions: suggestionList } });
      await expect.element(locator).not.toHaveAttribute('data-open');

      await locator.getByRole('combobox').click();
      await expect.element(locator).toHaveAttribute('data-open');

      await userEvent.keyboard('{Escape}');
      await expect.element(locator).not.toHaveAttribute('data-open');
    });

    it('does not clear, open the popup or reset on Escape when read-only', async () => {
      const clearValueSpy = vi.fn<() => void>();
      const { locator } = await render(Searchbar, {
        inputs: { readonly: true, suggestions: suggestionList, value: 'Pensione' },
        outputs: { clearValue: clearValueSpy }
      });
      const combobox = locator.getByRole('combobox');

      await expect.element(combobox).toHaveAttribute('readonly');
      await expect.element(locator.getByRole('button', { name: 'Cancella testo' })).toBeDisabled();

      await combobox.click();
      await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();

      await userEvent.keyboard('{Escape}');
      await expect.element(combobox).toHaveValue('Pensione');
      expect(clearValueSpy).not.toHaveBeenCalled();
    });
  });

  describe('<drgn-field> integration', () => {
    it('associates the input with the field label and description', async () => {
      const { locator } = await render(FieldFormHost);
      const searchbox = locator.getByRole('searchbox', { name: /Cerca/ });
      const description = locator.getByText('Inserisci testo');

      await expect.element(searchbox).toBeInTheDocument();
      await expect.element(description).toBeInTheDocument();
      await expect.element(searchbox).toHaveAttribute('aria-describedby', description.element().id);
    });

    it('synchronizes the query with the form signal both ways', async () => {
      const { fixture, locator, componentClassInstance: host } = await render(FieldFormHost);
      const searchbox = locator.getByRole('searchbox', { name: /Cerca/ });

      await searchbox.fill('Pensione');
      await fixture.whenStable();
      expect(host.form.query().value()).toBe('Pensione');

      host.form.query().value.set('Riforma');
      await fixture.whenStable();
      await expect.element(searchbox).toHaveValue('Riforma');
    });

    it('marks the field touched when the searchbar loses the focus via Tab', async () => {
      const { fixture, locator, componentClassInstance: host } = await render(FieldFormHost);
      const searchbox = locator.getByRole('searchbox', { name: /Cerca/ });
      await searchbox.click();

      await tabOut(locator.getByTestId('outside'));
      await fixture.whenStable();

      expect(host.form.query().touched()).toBeTruthy();
    });

    it('shows the validation errors in the field', async () => {
      const { fixture, locator } = await render(FieldFormHost);
      const searchbox = locator.getByRole('searchbox', { name: /Cerca/ });
      await searchbox.click();

      await tabOut(locator.getByTestId('outside'));
      await fixture.whenStable();

      await expect.element(locator.getByRole('alert')).toHaveTextContent('Campo obbligatorio');
    });
  });
});
