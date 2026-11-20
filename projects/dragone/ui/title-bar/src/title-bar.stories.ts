import { provideIcons } from '@ng-icons/core';
import {
  faSolidEllipsisVertical,
  faSolidGear,
  faSolidPen,
  faSolidShareNodes,
  faSolidTrash
} from '@ng-icons/font-awesome/solid';
import { argsToTemplate, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import type { LayoutType, ThemeType } from '@dragone/ui/utils';

import { TitleBar, type TitleBarActionItem } from './title-bar';

type TitleBarStory = TitleBar & {
  darkMode: boolean;
  layout: LayoutType;
  theme: ThemeType;
  actions: TitleBarActionItem[];
  onAction: (action: TitleBarActionItem) => void;
};

const DESKTOP_ACTIONS: TitleBarActionItem[] = [
  { label: 'Modifica', icon: 'faSolidPen' },
  { label: 'Condividi', icon: 'faSolidShareNodes' },
  { label: 'Elimina', icon: 'faSolidTrash' }
];

const ACTION_STATES: TitleBarActionItem[] = [
  { label: 'Aggiungi', icon: 'faSolidGear', iconOnly: true },
  { label: 'Modifica', icon: 'faSolidPen' },
  { label: 'Condividi', icon: 'faSolidShareNodes' },
  { label: 'Elimina', icon: 'faSolidTrash', disabled: true }
];

const meta: Meta<TitleBarStory> = {
  title: 'Dragone/UI/TitleBar',
  component: TitleBar,
  tags: ['autodocs'],
  args: {
    title: 'Progetti',
    subtitle: '12 elementi',
    titleAsHeading: false,
    headingLevel: 5,
    collapseActions: true,
    overflowMenuLabel: 'Altre azioni',
    theme: 'light',
    layout: 'desktop',
    actions: DESKTOP_ACTIONS,
    onAction: fn()
  },
  argTypes: {
    title: {
      description: 'The title text',
      control: 'text'
    },
    subtitle: {
      description: 'The optional subtitle text',
      control: 'text'
    },
    titleAsHeading: {
      description: 'Whether the title is exposed as a heading',
      control: 'boolean',
      table: {
        defaultValue: { summary: 'false' }
      }
    },
    headingLevel: {
      description: 'The heading level used when titleAsHeading is true',
      options: [1, 2, 3, 4, 5, 6],
      control: { type: 'select' },
      if: { arg: 'titleAsHeading', truthy: true },
      table: {
        defaultValue: { summary: '5' }
      }
    },
    collapseActions: {
      description: 'Whether multiple actions collapse into the overflow menu on mobile',
      control: 'boolean',
      table: {
        defaultValue: { summary: 'true' }
      }
    },
    overflowMenuLabel: {
      description: 'The accessible name of the mobile overflow trigger',
      control: 'text',
      table: {
        defaultValue: { summary: 'Altre azioni' }
      }
    },
    theme: {
      description: 'The theme of the title bar',
      options: ['light', 'dark'],
      control: { type: 'select' },
      table: {
        defaultValue: { summary: 'light' }
      }
    },
    layout: {
      description: 'The layout of the title bar',
      options: ['desktop', 'mobile'],
      control: { type: 'select' },
      table: {
        defaultValue: { summary: 'desktop' }
      }
    },
    actions: {
      description: 'The action items rendered as buttons or overflow menu items',
      control: 'object'
    },
    onAction: {
      type: 'function',
      control: false
    }
  },
  decorators: [
    moduleMetadata({
      providers: [
        provideIcons({
          faSolidEllipsisVertical,
          faSolidGear,
          faSolidPen,
          faSolidShareNodes,
          faSolidTrash
        })
      ]
    })
  ],
  render: args => ({
    props: args,
    template: `
      <drgn-title-bar
        ${argsToTemplate(args, { exclude: ['darkMode', 'onAction', 'actions'] })}
        [actions]="actions"
        (actionClick)="onAction($event)"
      />
    `
  })
};

export default meta;
type Story = StoryObj<TitleBarStory>;

const DesktopTemplate: Story = {
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step('Click the Modifica action', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Modifica' }));
      await expect(args.onAction).toHaveBeenCalledTimes(1);
      await expect(args.onAction).toHaveBeenCalledWith(args.actions[0]);
    });
  }
};

export const DesktopLight: Story = {
  ...DesktopTemplate,
  args: {
    theme: 'light',
    layout: 'desktop'
  }
};

export const DesktopDark: Story = {
  ...DesktopTemplate,
  args: {
    theme: 'dark',
    layout: 'desktop'
  }
};

export const MobileStandard: Story = {
  args: {
    theme: 'light',
    layout: 'mobile',
    actions: [{ label: 'Modifica', icon: 'faSolidPen' }]
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step('Click the single inline action', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Modifica' }));
      await expect(args.onAction).toHaveBeenCalledTimes(1);
      await expect(args.onAction).toHaveBeenCalledWith(args.actions[0]);
    });
  }
};

export const MobileCollapsedLight: Story = {
  args: {
    theme: 'light',
    layout: 'mobile'
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await step('Open the overflow menu', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Altre azioni' }));
      await expect(body.getByRole('menu')).toBeVisible();
    });

    await step('Click the Modifica menu item', async () => {
      await userEvent.click(body.getByRole('menuitem', { name: 'Modifica' }));
      await expect(args.onAction).toHaveBeenCalledTimes(1);
      await expect(args.onAction).toHaveBeenCalledWith(args.actions[0]);
      await expect(body.getByRole('menu')).not.toBeInTheDocument();
    });
  }
};

export const MobileCollapsedDark: Story = {
  args: {
    theme: 'dark',
    layout: 'mobile'
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await step('Open the overflow menu', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Altre azioni' }));
      await expect(body.getByRole('menu')).toBeVisible();
    });

    await step('Close the overflow menu with Escape', async () => {
      await userEvent.keyboard('{Escape}');
      await expect(body.getByRole('menu')).not.toBeInTheDocument();
      await expect(canvas.getByRole('button', { name: 'Altre azioni' })).toHaveFocus();
    });
  }
};

const ActionStatesTemplate: Story = {
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step('Verify the icon-only action accessible name', async () => {
      await expect(canvas.getByRole('button', { name: 'Aggiungi' })).toBeVisible();
    });

    await step('Verify the disabled action state', async () => {
      await expect(canvas.getByRole('button', { name: 'Elimina' })).toBeDisabled();
    });

    await step('Click the Modifica action', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Modifica' }));
      await expect(args.onAction).toHaveBeenCalledTimes(1);
      await expect(args.onAction).toHaveBeenCalledWith(args.actions[1]);
    });
  }
};

export const ActionStatesLight: Story = {
  ...ActionStatesTemplate,
  args: {
    theme: 'light',
    layout: 'desktop',
    actions: ACTION_STATES
  }
};

export const ActionStatesDark: Story = {
  ...ActionStatesTemplate,
  args: {
    theme: 'dark',
    layout: 'desktop',
    actions: ACTION_STATES
  }
};
