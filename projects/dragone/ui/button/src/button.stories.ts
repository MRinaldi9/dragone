import {
  argsToTemplate,
  moduleMetadata,
  type Meta,
  type StoryObj,
} from '@analogjs/storybook-angular';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidArrowRight } from '@ng-icons/font-awesome/solid';
import { expect, fn } from 'storybook/test';
import { Button } from './button';

type ButtonStory = Button & {
  disabled: boolean;
  icon: boolean;
  focusVisible: () => boolean;
  label: string;
  showLeadingIcon: boolean;
  showTrailingIcon: boolean;
};

const meta: Meta<ButtonStory> = {
  title: 'Dragone/UI/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    focusVisible: fn(),
    label: 'Dragone',
    disabled: false,
    icon: false,
    showLeadingIcon: false,
    showTrailingIcon: false,
    size: 'large',
    variant: 'primary',
  },
  argTypes: {
    focusVisible: { type: 'function', control: false },
    label: { control: 'text' },
    showLeadingIcon: { control: 'boolean' },
    showTrailingIcon: { control: 'boolean' },
    size: {
      description: 'The size of the button',
      type: 'string',
      options: ['small', 'medium', 'large'],
      control: { type: 'select' },
      table: {
        defaultValue: { summary: 'large' },
      },
    },
    variant: {
      description: 'The variant of the button',
      type: 'string',
      options: ['primary', 'secondary', 'tertiary', 'ghost', 'danger'],
      control: { type: 'select' },
      table: {
        defaultValue: { summary: 'primary' },
      },
    },
    disabled: {
      description: 'Whether the button is disabled',
      type: 'boolean',
      control: { type: 'boolean' },
      table: {
        defaultValue: { summary: 'false' },
      },
    },
  },
  decorators: [
    moduleMetadata({ providers: [provideIcons({ faSolidArrowRight })], imports: [NgIcon] }),
  ],
  render: args => {
    return {
      props: args,
      template: `
      <button drgnButton ${argsToTemplate(args, { exclude: ['darkMode', 'label', 'showLeadingIcon', 'showTrailingIcon'] })}>
        ${args.showLeadingIcon ? '<ng-icon slot="leading" name="fa-solid-arrow-right"></ng-icon>' : ''}
        ${args.label}
        ${args.showTrailingIcon ? '<ng-icon slot="trailing" name="fa-solid-arrow-right"></ng-icon>' : ''}
      </button>
      `,
    };
  },
};

export default meta;
type Story = StoryObj<ButtonStory>;

const Template: Story = {
  play: async ({ canvas, userEvent, canvasElement, args, step }) => {
    const button = canvas.getByRole<HTMLButtonElement>('button');
    await step('Click on button', async () => {
      await userEvent.click(button);
      await expect(args.focusVisible).not.toHaveBeenCalled();
    });

    await userEvent.click(canvasElement);

    await step('Focus visible on button', async () => {
      await userEvent.tab();
      await expect(button).toHaveFocus();
      await expect(args.focusVisible).toHaveBeenCalled();
    });
  },
};

export const Primary: Story = {
  ...Template,
  args: {
    variant: 'primary',
  },
};

export const Secondary: Story = {
  ...Template,
  args: {
    variant: 'secondary',
  },
};

export const Tertiary: Story = {
  ...Template,
  args: {
    variant: 'tertiary',
  },
};

export const Danger: Story = {
  ...Template,
  args: {
    variant: 'danger',
  },
};

export const WithTrailingIcon: Story = {
  ...Template,
  args: {
    showTrailingIcon: true,
  },
};

export const IconOnly: Story = {
  ...Template,
  args: {
    label: '',
    showLeadingIcon: true,
    icon: true,
  },
};
