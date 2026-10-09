import { moduleMetadata, type Meta, type StoryObj } from '@analogjs/storybook-angular';
import { expect, userEvent, within } from 'storybook/test';

import { Dropdown } from './dropdown';
import { DropdownOption } from './dropdown-option/dropdown-option';
import { DropdownPortal } from './dropdown-portal/dropdown-portal';
import { DropdownSearch } from './dropdown-search/dropdown-search';
import { DropdownTrigger } from './dropdown-trigger/dropdown-trigger';

const meta: Meta<Dropdown> = {
  title: 'Dragone/UI/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [Dropdown, DropdownOption, DropdownPortal, DropdownSearch, DropdownTrigger]
    })
  ]
};

export default meta;

type Story = StoryObj<Dropdown>;

export const Default: Story = {
  render: () => ({
    props: { selected: undefined as string | undefined },
    template: `
      <button
        drgnDropdownTrigger
        style="padding: 16px; min-width: 190px;"
        (valueChange)="selected = $event"
      >
        Apri dropdown
        @if (selected) {
          · <span data-testid="trigger-value">{{ selected }}</span>
        }
        <drgn-dropdown *drgnDropdownPortal>
          <drgn-dropdown-option value="a">Opzione A</drgn-dropdown-option>
          <drgn-dropdown-option value="b">Opzione B</drgn-dropdown-option>
          <drgn-dropdown-option value="c">Opzione C</drgn-dropdown-option>
          <drgn-dropdown-option value="d" disabled>Opzione D</drgn-dropdown-option>
        </drgn-dropdown>
      </button>
    `
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('combobox'));

    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(body.getByRole('option', { name: 'Opzione B' }));

    await expect(canvas.getByTestId('trigger-value')).toHaveTextContent('b');
  }
};

export const Scrollable: Story = {
  render: () => ({
    props: {
      selected: undefined as string | undefined,
      options: Array.from({ length: 40 }, (_, index) => ({
        value: `opt-${index}`,
        label: `Opzione ${index + 1}`
      }))
    },
    template: `
      <button
        drgnDropdownTrigger
        style="padding: 16px; min-width: 190px;"
        (valueChange)="selected = $event"
      >
        Apri dropdown
        @if (selected) {
          · <span data-testid="trigger-value">{{ selected }}</span>
        }
        <drgn-dropdown *drgnDropdownPortal>
          @for (option of options; track option.value) {
            <drgn-dropdown-option [value]="option.value">{{ option.label }}</drgn-dropdown-option>
          }
        </drgn-dropdown>
      </button>
    `
  })
};

export const WithSearch: Story = {
  render: () => ({
    props: {
      selected: undefined as string | undefined,
      query: '',
      options: [
        { value: 'a', label: 'Opzione A' },
        { value: 'b', label: 'Opzione B' },
        { value: 'c', label: 'Opzione C' },
        { value: 'd', label: 'Altra voce' }
      ],
      // Filtering is the consumer's job: DropdownSearch only emits the query.
      matches: (label: string, query: string) =>
        label.toLowerCase().includes(query.trim().toLowerCase())
    },
    template: `
      <button
        drgnDropdownTrigger
        style="padding: 16px; min-width: 190px;"
        (valueChange)="selected = $event"
        (openChange)="query = ''"
      >
        Apri dropdown
        @if (selected) {
          · <span data-testid="trigger-value">{{ selected }}</span>
        }
        <!-- The search field is recreated empty on every open, hence the reset on openChange. -->
        <drgn-dropdown *drgnDropdownPortal>
          <drgn-dropdown-search (queryChange)="query = $event" />
          @for (option of options; track option.value) {
            @if (matches(option.label, query)) {
              <drgn-dropdown-option [value]="option.value">{{ option.label }}</drgn-dropdown-option>
            }
          }
        </drgn-dropdown>
      </button>
    `
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('combobox'));

    const body = within(canvasElement.ownerDocument.body);
    const search = body.getByPlaceholderText('Cerca');
    await userEvent.type(search, 'zzz');
    await expect(body.getByRole('status')).toHaveTextContent('Nessun risultato');

    await userEvent.clear(search);
    await userEvent.type(search, 'altra');

    await expect(body.queryByRole('option', { name: 'Opzione A' })).not.toBeInTheDocument();
    await userEvent.click(body.getByRole('option', { name: 'Altra voce' }));
    await expect(canvas.getByTestId('trigger-value')).toHaveTextContent('d');
  }
};
