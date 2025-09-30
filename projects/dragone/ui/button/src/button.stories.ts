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

type ButtonStory = Button & { disabled: boolean; icon: boolean; focusVisible: () => boolean };

const meta: Meta<ButtonStory> = {
  title: 'Dragone/UI/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    focusVisible: fn(),
  },
  argTypes: {
    focusVisible: { type: 'function', control: false },
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
  render: args => {
    return {
      props: args,
      template: `<button drgn-button ${argsToTemplate(args)}>Dragone</button>`,
    };
  },
};

export default meta;
type Story = StoryObj<ButtonStory>;

export const ButtonPrimary: Story = {
  args: {
    variant: 'primary',
    size: 'large',
  },
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

export const ButtonPrimaryWithIcon: Story = {
  args: {
    ...ButtonPrimary.args,
  },
  decorators: [
    moduleMetadata({ providers: [provideIcons({ faSolidArrowRight })], imports: [NgIcon] }),
  ],
  render: args => ({
    props: args,
    template: `<button drgn-button ${argsToTemplate(args)}>Dragone <ng-icon slot="trailing" name="fa-solid-arrow-right"></ng-icon></button>`,
  }),
  play: async ({ context }) => {
    await ButtonPrimary.play?.(context);
  },
};

export const ButtonPrimaryOnlyIcon: Story = {
  args: {
    ...ButtonPrimary.args,
    icon: true,
  },
  decorators: [
    moduleMetadata({ providers: [provideIcons({ faSolidArrowRight })], imports: [NgIcon] }),
  ],
  render: args => ({
    props: args,
    template: `<button drgn-button ${argsToTemplate(args)}><ng-icon name="fa-solid-arrow-right"></ng-icon></button>`,
  }),
  play: async ({ context }) => {
    await ButtonPrimary.play?.(context);
  },
};

export const ButtonSecondary: Story = {
  args: {
    variant: 'secondary',
    size: 'large',
  },
};

export const ButtonSecondaryWithIcon: Story = {
  args: {
    ...ButtonSecondary.args,
  },
  decorators: [
    moduleMetadata({ providers: [provideIcons({ faSolidArrowRight })], imports: [NgIcon] }),
  ],
  render: args => ({
    props: args,
    template: `<button drgn-button ${argsToTemplate(args)}>Dragone <ng-icon slot="trailing" name="fa-solid-arrow-right"></ng-icon></button>`,
  }),
};

export const ButtonSecondaryOnlyIcon: Story = {
  args: {
    ...ButtonSecondary.args,
    icon: true,
  },
  decorators: [
    moduleMetadata({ providers: [provideIcons({ faSolidArrowRight })], imports: [NgIcon] }),
  ],
  render: args => ({
    props: args,
    template: `<button drgn-button ${argsToTemplate(args)}><ng-icon name="fa-solid-arrow-right"></ng-icon></button>`,
  }),
};

export const ButtonDanger: Story = {
  args: {
    variant: 'danger',
    size: 'large',
  },
};

export const ButtonDangerWithIcon: Story = {
  args: {
    ...ButtonDanger.args,
  },
  decorators: [
    moduleMetadata({ providers: [provideIcons({ faSolidArrowRight })], imports: [NgIcon] }),
  ],
  render: args => ({
    props: args,
    template: `<button drgn-button ${argsToTemplate(args)}>Dragone <ng-icon slot="trailing" name="fa-solid-arrow-right"></ng-icon></button>`,
  }),
};

export const ButtonDangerOnlyIcon: Story = {
  args: {
    ...ButtonDanger.args,
    icon: true,
  },
  decorators: [
    moduleMetadata({ providers: [provideIcons({ faSolidArrowRight })], imports: [NgIcon] }),
  ],
  render: args => ({
    props: args,
    template: `<button drgn-button ${argsToTemplate(args)}><ng-icon name="fa-solid-arrow-right"></ng-icon></button>`,
  }),
};
