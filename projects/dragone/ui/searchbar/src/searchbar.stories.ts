import type { Meta, StoryObj } from '@analogjs/storybook-angular';
import { fn } from 'storybook/test';

import { Searchbar } from './searchbar';

type SearchbarStory = Searchbar;

const meta: Meta<SearchbarStory> = {
  title: 'Dragone/UI/Searchbar',
  component: Searchbar,
  tags: ['autodocs'],
  args: {
    label: 'Label',
    placeholder: 'Text',
    helperText: 'Helper text',
    searchLabel: 'Ricerca',
    clearAllLabel: 'Cancella tutto',
    clearInputAriaLabel: 'Cancella testo',
    value: '',
    size: 'large',
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    label: {
      control: { type: 'text' },
    },
    placeholder: {
      control: { type: 'text' },
    },
    helperText: {
      control: { type: 'text' },
    },
    searchLabel: {
      control: { type: 'text' },
    },
    clearAllLabel: {
      control: { type: 'text' },
    },
    clearInputAriaLabel: {
      control: { type: 'text' },
    },
    value: {
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<SearchbarStory>;

export const Default: Story = {
  render: args => ({
    props: {
      ...args,
      onSearchSubmit: fn(),
      onValueChange: fn(),
    },
    template: `
      <div style="max-width: 694px; width: 100%;">
        <drgn-searchbar
          [size]="size"
          [label]="label"
          [placeholder]="placeholder"
          [helperText]="helperText"
          [searchLabel]="searchLabel"
          [clearAllLabel]="clearAllLabel"
          [clearInputAriaLabel]="clearInputAriaLabel"
          [value]="value"
          [chipsItem]="chipsItem"
          (searchSubmit)="onSearchSubmit($event)"
          (valueChange)="onValueChange($event)"
        />
      </div>
    `,
  }),
};

export const Focus: Story = {
  args: {
    value: 'Pensione',
  },
  render: Default.render,
};

export const ValuedWithChips: Story = {
  args: {
    value: '',
  },
  render: args => ({
    props: {
      ...args,
      onSearchSubmit: fn(),
      onValueChange: fn(),
      onRemoveChip: fn(),
      onClearAll: fn(),
    },
    template: `
      <div style="max-width: 694px; width: 100%;">
        <drgn-searchbar
          [size]="size"
          [label]="label"
          [placeholder]="placeholder"
          [helperText]="helperText"
          [searchLabel]="searchLabel"
          [clearAllLabel]="clearAllLabel"
          [clearInputAriaLabel]="clearInputAriaLabel"
          [value]="value"
          [chipsItem]="chipsItem"
          (searchSubmit)="onSearchSubmit($event)"
          (valueChange)="onValueChange($event)"
          (removeChip)="onRemoveChip($event)"
          (clearAll)="onClearAll()"
        />
      </div>
    `,
  }),
};
