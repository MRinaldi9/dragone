import { argsToTemplate, type Meta, type StoryObj } from '@analogjs/storybook-angular';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Select } from './select';

type SelectStory = Select<string | { label: string; value: string } | number> & {
  darkMode: boolean;
  disabled: boolean;
  id: string;
  multiple: boolean;
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
      { label: 'Option 3', value: 'option3' }
    ],
    placeholder: 'Select an option',
    multiple: false,
    optionLabel: 'label',
    valueChange: fn(),
    openChange: fn()
  },
  argTypes: {
    disabled: {
      description: 'Whether the select is disabled',
      type: 'boolean',
      control: { type: 'boolean' },
      table: {
        defaultValue: { summary: 'false' }
      }
    },
    options: {
      description: 'Options rendered in the select',
      control: { type: 'object' }
    },
    placeholder: {
      description: 'Placeholder text for the select',
      type: 'string',
      control: { type: 'text' }
    },
    id: {
      type: 'string',
      description: 'The id of the select element',
      control: { type: 'text' }
    },
    multiple: {
      type: 'boolean',
      description: 'Whether the select allows multiple selections',
      control: { type: 'boolean' },
      table: { defaultValue: { summary: 'false' } }
    },
    optionLabel: {
      type: 'string',
      description:
        'A string that maps an option to its display label. If not provided, the option itself will be used as the label.',
      control: { type: 'text' }
    },
    optionValue: {
      type: 'string',
      description:
        'A string that maps an option to its value. If not provided, the option itself will be used as the value.',
      control: { type: 'text' }
    },
    emptyLabel: {
      type: 'string',
      description: 'Message shown, and announced, when the panel has no option to offer.',
      control: { type: 'text' }
    },
    offset: {
      type: 'number',
      description:
        'The gap in px between the trigger and the panel. Defaults to 8 per the Sirio spec.',
      control: { type: 'number' },
      table: {
        defaultValue: { summary: '8' }
      }
    },
    valueChange: {
      description: 'Event emitted when the selected value changes',
      action: 'valueChange',
      control: false
    },
    openChange: {
      description: 'Event emitted when the select dropdown opens or closes',
      action: 'openChange',
      control: false
    },
    hidden: {
      type: 'boolean',
      description: 'Whether the select is hidden',
      control: { type: 'boolean' },
      table: {
        defaultValue: { summary: 'false' }
      }
    },
    readonly: {
      type: 'boolean',
      description: 'Whether the select is read-only',
      control: { type: 'boolean' },
      table: {
        defaultValue: { summary: 'false' }
      }
    }
  },
  render: args => ({
    props: args,
    template: `
        <drgn-select ${argsToTemplate(args, { exclude: ['darkMode'] })}/>
      `
  })
};

export default meta;

type Story = StoryObj<SelectStory>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('combobox'));

    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(body.getByRole('option', { name: 'Option 2' }));

    // Selecting closes the panel and surfaces the mapped label on the trigger.
    await expect(args.valueChange).toHaveBeenCalledWith({ label: 'Option 2', value: 'option2' });
    await expect(canvas.getByText('Option 2')).toBeInTheDocument();
  }
};
