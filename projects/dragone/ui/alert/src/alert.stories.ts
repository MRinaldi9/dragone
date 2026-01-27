import { argsToTemplate, type Meta, type StoryObj } from '@analogjs/storybook-angular';
import { Alert } from './alert';

type AlertStory = Alert & {
  darkMode: boolean;
  title: string;
  message: string;
  closeable: boolean;
};

const meta: Meta<AlertStory> = {
  title: 'Dragone/UI/Alert',
  component: Alert,
  tags: ['autodocs'],
  args: {
    alertTheme: 'light',
    aspect: 'desktop',
    title: 'This is an alert title',
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
    alertTheme: {
      options: ['light', 'dark'],
      control: { type: 'select' },
      table: {
        defaultValue: { summary: 'light' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<AlertStory>;

export const Info: Story = {
  args: {},
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
