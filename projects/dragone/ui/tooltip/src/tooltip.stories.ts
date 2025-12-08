import type { Meta, StoryObj } from '@analogjs/storybook-angular';
import { argsToTemplate, moduleMetadata } from '@analogjs/storybook-angular';
import { provideTooltipConfig } from 'ng-primitives/tooltip';
import { expect, fn } from 'storybook/test';
import { TooltipTrigger } from './tooltip-trigger/tooltip-trigger';
import { Tooltip } from './tooltip/tooltip';

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
      providers: [provideTooltipConfig({ container: '.tooltip-container' })],
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
      <div class="tooltip-container"></div>
    `,
  }),
};

export default meta;
type Story = StoryObj<TooltipStory>;

export const Default: Story = {
  args: {
    tooltipContent: 'This is a helpful tooltip',
  },
  play: async ({ canvas, userEvent }) => {
    const button = await canvas.getByRole('button', { name: 'Hover me' });
    await userEvent.hover(button);
    const tooltip = await canvas.getByRole('tooltip');
    await expect(tooltip).toBeInTheDocument();
    await expect(tooltip).toHaveTextContent('This is a helpful tooltip');
  },
};

export const WithTitleAndBody: Story = {
  args: {
    tooltipContent: {
      title: 'Important Information',
      body: 'This tooltip provides additional context about the element.',
    },
  },
  play: async ({ canvas, userEvent }) => {
    const button = await canvas.getByRole('button', { name: 'Hover me' });
    await userEvent.hover(button);
    const tooltip = await canvas.getByRole('tooltip');
    await expect(tooltip).toBeInTheDocument();
    const tooltipTitle = tooltip.querySelector('strong');
    const tooltipBody = tooltip.querySelector('p');
    await expect(tooltipTitle).toHaveTextContent('Important Information');
    await expect(tooltipBody).toHaveTextContent(
      'This tooltip provides additional context about the element.',
    );
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
  play: async ({ canvas, userEvent, args }) => {
    const button = await canvas.getByRole('button', { name: 'Hover me' });
    await userEvent.hover(button);
    const tooltip = await canvas.getByRole('tooltip');
    await expect(tooltip).toBeInTheDocument();
    const tooltipTitle = tooltip.querySelector('strong');
    const tooltipBody = tooltip.querySelector('p');
    await expect(tooltipTitle).toHaveTextContent('Delete Item');
    await expect(tooltipBody).toHaveTextContent(
      'This action cannot be undone. All data will be permanently deleted.',
    );
    const actionButton = await canvas.getByRole('button', { name: 'Delete' });
    await userEvent.click(actionButton);
    await expect((args.tooltipContent as { action: () => void }).action).toHaveBeenCalled();
  },
};
