import type { Meta, StoryObj } from '@analogjs/storybook-angular';
import { argsToTemplate, moduleMetadata } from '@analogjs/storybook-angular';
import { fn } from 'storybook/test';
import { TooltipTrigger } from './tooltip-trigger/tooltip-trigger';
import { Tooltip } from './tooltip/tooltip';
import {} from '@storybook/addon-a11y'

type TooltipStory = TooltipTrigger & {
  tooltipContent:
    | string
    | { title?: string; body?: string; action?: () => void; actionLabel?: string };
  darkMode: boolean;
};

const meta: Meta<TooltipStory> = {
  title: 'Dragone/UI/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [TooltipTrigger],
    }),
  ],

  argTypes: {
    tooltipContent: {
      control: 'object',
      description:
        'Content displayed in the tooltip. Can be a string or an object with title, body, and optional action.',
      table: {
        type: {
          summary:
            'string | { title?: string; body?: string; action?: () => void; actionLabel?: string }',
        },
      },
    },
  },
  render: args => ({
    props: args,
    template: `
      <button drgnTooltip ${argsToTemplate(args, { exclude: ['darkMode'] })}>
        Hover me
      </button>
    `,
  }),
};

export default meta;
type Story = StoryObj<TooltipStory>;

export const Default: Story = {
  args: {
    tooltipContent: 'This is a helpful tooltip',
  },
};

export const WithTitleAndBody: Story = {
  args: {
    tooltipContent: {
      title: 'Important Information',
      body: 'This tooltip provides additional context about the element.',
    },
  },
};

export const WithAction: Story = {
  args: {
    tooltipContent: {
      title: 'Delete Item',
      body: 'This action cannot be undone. All data will be permanently deleted.',
      action: fn(() => console.log('Delete action triggered')),
      actionLabel: 'Delete',
    },
  },
};
