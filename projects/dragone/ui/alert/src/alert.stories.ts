import { argsToTemplate, type Meta, type StoryObj } from '@analogjs/storybook-angular';
import { fn } from 'storybook/test';

import { Alert } from './alert';

type AlertStory = Alert & {
  darkMode: boolean;
  theme: 'light' | 'dark';
};

const meta: Meta<AlertStory> = {
  title: 'Dragone/UI/Alert',
  component: Alert,
  tags: ['autodocs'],
  args: {
    theme: 'light',
    aspect: 'desktop',
    alertType: 'info',
    titleAsHeading: false,
    headingLevel: 4,
    ctaClick: fn(),
  },
  argTypes: {
    title: {
      control: 'text',
    },
    aspect: {
      options: ['mobile', 'desktop'],
      control: { type: 'select' },
      table: {
        defaultValue: { summary: 'desktop' },
      },
    },
    theme: {
      options: ['light', 'dark'],
      control: { type: 'select' },
      table: {
        defaultValue: { summary: 'light' },
      },
    },
    alertType: {
      options: ['info', 'success', 'warning', 'error'],
      control: { type: 'select' },
      table: {
        defaultValue: { summary: 'info' },
      },
    },
    titleAsHeading: {
      control: 'boolean',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    headingLevel: {
      options: [1, 2, 3, 4, 5, 6],
      control: { type: 'select' },
      if: { arg: 'titleAsHeading', truthy: true },
      table: {
        defaultValue: { summary: '4' },
      },
    },
    ctaText: {
      control: 'text',
    },
    ctaClick: {
      if: { arg: 'ctaText', truthy: true },
      type: 'function',
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<AlertStory>;

export const Info: Story = {
  args: {
    title: 'This is an alert title',
    ctaText: 'CTA',
  },
  render: args => ({
    props: args,
    template: `
        <drgn-alert ${argsToTemplate(args, { exclude: ['darkMode'] })} >
          Labore doloribus ea consequatur quam sequi similique unde.
          Et ad laudantium sint aliquid dolores. Aut est rerum illum nulla corrupti reiciendis eum.
        </drgn-alert>
    `,
  }),
};
