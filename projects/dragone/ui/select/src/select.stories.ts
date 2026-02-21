import { argsToTemplate, type Meta, type StoryObj } from '@analogjs/storybook-angular';
import { Select } from './select';
import { fn } from 'storybook/test';

type SelectStory = Select<string | { label: string; value: string } | number> & {
  darkMode: boolean;
  disabled: boolean;
  id: string;
  multiple: boolean;
  valueChange: (
    value:
      | string
      | string[]
      | { label: string; value: string }
      | { label: string; value: string }[],
  ) => void;
  openChange: (isOpen: boolean) => void;
};

const meta: Meta<SelectStory> = {
  title: 'Dragone/UI/Select',
  component: Select,
  tags: ['autodocs'],
  args: {
    disabled: false,
    options: [
      { label: 'Option 1', value: 'option1' },
      { label: 'Option 2', value: 'option2' },
      { label: 'Option 3', value: 'option3' },
    ],
    placeholder: 'Select an option',
    multiple: false,
    valueChange: fn(),
    openChange: fn(),
  },
  argTypes: {
    disabled: {
      description: 'Whether the select is disabled',
      type: 'boolean',
      control: { type: 'boolean' },
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    options: {
      description: 'Options rendered in the select',
      control: { type: 'object' },
    },
    placeholder: {
      description: 'Placeholder text for the select',
      type: 'string',
      control: { type: 'text' },
    },
    id: {
      type: 'string',
      description: 'The id of the select element',
      control: { type: 'text' },
    },
    multiple: {
      type: 'boolean',
      description: 'Whether the select allows multiple selections',
      control: { type: 'boolean' },
      table: { defaultValue: { summary: 'false' } },
    },
    optionLabel: {
      type: 'string',
      description:
        'A string that maps an option to its display label. If not provided, the option itself will be used as the label.',
      control: { type: 'text' },
    },
    optionValue: {
      type: 'string',
      description:
        'A string that maps an option to its value. If not provided, the option itself will be used as the value.',
      control: { type: 'text' },
    },
    valueChange: {
      description: 'Event emitted when the selected value changes',
      action: 'valueChange',
      control: false,
    },
    openChange: {
      description: 'Event emitted when the select dropdown opens or closes',
      action: 'openChange',
      control: false,
    },
  },
  render: args => {
    return {
      props: args,
      template: `
        <drgn-select ${argsToTemplate(args, { exclude: ['darkMode'] })}/>
      `,
    };
  },
};

export default meta;

type Story = StoryObj<SelectStory>;

export const Default: Story = {};
