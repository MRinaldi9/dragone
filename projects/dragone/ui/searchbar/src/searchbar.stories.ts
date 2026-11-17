import { Directive, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { argsToTemplate, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Field } from '@dragone/ui/field';

import { Searchbar } from './searchbar';

@Directive({
  selector: '[drgnSearchbarStoryForm]',
  exportAs: 'searchForm'
})
class SearchbarStoryForm {
  readonly query = form(signal({ query: '' })).query;
}

type SearchbarStory = Searchbar & { darkMode: boolean };

const suggestions = ['Relazionale', 'Relazione', 'Relazioni', 'Relazioni industriali'];

const meta: Meta<SearchbarStory> = {
  title: 'Dragone/UI/Searchbar',
  component: Searchbar,
  tags: ['autodocs'],
  args: {
    value: '',
    placeholder: 'Text',
    searchLabel: 'Ricerca',
    clearInputAriaLabel: 'Cancella testo',
    suggestions: [],
    disabled: false,
    readonly: false,
    invalid: false,
    hidden: false,
    required: false,
    name: '',
    valueChange: fn(),
    touch: fn(),
    searchSubmit: fn(),
    clearValue: fn(),
    suggestionSelected: fn()
  },
  argTypes: {
    value: {
      description: 'The search query.',
      type: 'string',
      control: { type: 'text' }
    },
    placeholder: {
      description: 'Placeholder text of the input.',
      type: 'string',
      control: { type: 'text' }
    },
    searchLabel: {
      description:
        'Label of the submit button, also used as fallback aria-label of the input outside of a field.',
      type: 'string',
      control: { type: 'text' }
    },
    ariaLabel: {
      description: 'Explicit aria-label of the input when used outside of a labelled field.',
      type: 'string',
      control: { type: 'text' }
    },
    clearInputAriaLabel: {
      description: 'aria-label of the clear button.',
      type: 'string',
      control: { type: 'text' }
    },
    suggestions: {
      description:
        'Suggestions of the autocomplete model: empty renders the standard searchbar, populated enables the popup.',
      control: { type: 'object' }
    },
    disabled: {
      description: 'Whether the searchbar is disabled.',
      type: 'boolean',
      control: { type: 'boolean' }
    },
    readonly: {
      description: 'Whether the searchbar is read-only.',
      type: 'boolean',
      control: { type: 'boolean' }
    },
    invalid: {
      description: 'Whether the searchbar shows the invalid state.',
      type: 'boolean',
      control: { type: 'boolean' }
    },
    hidden: {
      description: 'Whether the searchbar is hidden.',
      type: 'boolean',
      control: { type: 'boolean' }
    },
    valueChange: {
      description: 'Emitted when the query changes.',
      action: 'valueChange',
      control: false
    },
    touch: {
      description: 'Emitted when the focus leaves the component.',
      action: 'touch',
      control: false
    },
    searchSubmit: {
      description: 'Emitted with the query when the user submits the search.',
      action: 'searchSubmit',
      control: false
    },
    clearValue: {
      description: 'Emitted when the query is cleared.',
      action: 'clearValue',
      control: false
    },
    suggestionSelected: {
      description: 'Emitted with the selected suggestion.',
      action: 'suggestionSelected',
      control: false
    }
  },
  decorators: [moduleMetadata({ imports: [Searchbar, Field, FormField, SearchbarStoryForm] })],
  render: args => ({
    props: args,
    template: `<drgn-searchbar ${argsToTemplate(args, { exclude: ['darkMode'] })} />`
  })
};

export default meta;
type Story = StoryObj<SearchbarStory>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('searchbox');

    await userEvent.type(input, 'Pensione');
    await expect(input).toHaveValue('Pensione');

    await userEvent.click(canvas.getByRole('button', { name: 'Ricerca' }));
    await expect(args.searchSubmit).toHaveBeenCalledWith('Pensione');

    await userEvent.click(canvas.getByRole('button', { name: 'Cancella testo' }));
    await expect(input).toHaveValue('');
    await expect(args.clearValue).toHaveBeenCalled();
    await expect(args.valueChange).toHaveBeenCalledWith('');
  }
};

export const Autocomplete: Story = {
  args: {
    suggestions
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('combobox'));
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    await expect(args.suggestionSelected).toHaveBeenCalledWith('Relazionale');
  }
};

export const WithField: Story = {
  render: args => ({
    props: args,
    template: `
      <drgn-field
        #searchForm="searchForm"
        drgnSearchbarStoryForm
        label="Cerca"
        description="Inserisci testo"
      >
        <drgn-searchbar
          ${argsToTemplate(args, { exclude: ['darkMode', 'value'] })}
          [formField]="searchForm.query"
        />
      </drgn-field>
    `
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('searchbox', { name: 'Cerca' });

    await userEvent.type(input, 'Pensione');

    await expect(input).toHaveValue('Pensione');
    await expect(args.valueChange).toHaveBeenCalledWith('Pensione');
  }
};

export const Disabled: Story = {
  args: {
    disabled: true
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('searchbox');

    await userEvent.click(input);
    await userEvent.keyboard('Pensione');

    await expect(input).toHaveValue('');
    await expect(args.valueChange).not.toHaveBeenCalled();
  }
};
