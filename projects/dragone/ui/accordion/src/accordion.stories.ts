import {
  argsToTemplate,
  moduleMetadata,
  type Meta,
  type StoryObj,
} from '@analogjs/storybook-angular';
import { fn } from 'storybook/test';
import { Accordion } from './accordion';
import { AccordionItem } from './accordion-item/accordion-item';

const meta: Meta<Accordion> = {
  title: 'Dragone/UI/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  args: {
    collapse: true,
    type: 'single',
    disabled: false,
    orientation: 'vertical',
    heading: 'Dragone',
    accordionChange: fn(),
    accordionVariant: 'dark',
  },
  argTypes: {
    collapse: {
      type: 'boolean',
      control: { type: 'boolean' },
      description: 'Allows all accordion items to be collapsed',
    },
    heading: { control: 'text' },
    type: {
      type: 'string',
      control: 'select',
      options: ['single', 'multiple'],
      table: { defaultValue: { summary: 'single' } },
    },
    accordionVariant: {
      type: 'string',
      control: 'select',
      options: ['dark', 'light'],
      table: { defaultValue: { summary: 'dark' } },
    },
    disabled: {
      description: 'Disables the accordion if set to true',
      type: 'boolean',
      control: { type: 'boolean' },
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    accordionChange: { type: 'function', control: false },
  },
  decorators: [moduleMetadata({ imports: [AccordionItem] })],
};

export default meta;
type Story = StoryObj<Accordion>;

export const AccordionSingle: Story = {
  render: args => {
    return {
      props: args,
      template: `
      <drgn-accordion style="max-width: 24rem;" ${argsToTemplate(args, { exclude: ['heading', 'darkMode', 'accordionVariant'] })}>
        <drgn-accordion-item ${argsToTemplate({ ...args, heading: args.heading }, { exclude: ['darkMode', 'collapse', 'type', 'orientation'] })}>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </drgn-accordion-item>
      </drgn-accordion>
      `,
    };
  },
};
export const AccordionMultiple: Story = {
  args: {
    type: 'multiple',
  },
  render: args => {
    return {
      props: args,
      template: `
      <drgn-accordion style="max-width: 24rem;" ${argsToTemplate(args, { exclude: ['heading', 'darkMode', 'accordionVariant'] })}>
        <drgn-accordion-item ${argsToTemplate({ ...args, heading: args.heading }, { exclude: ['darkMode', 'collapse', 'type', 'orientation'] })}>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </drgn-accordion-item>
        <drgn-accordion-item heading="Dragone#2" ${argsToTemplate({ ...args }, { exclude: ['darkMode', 'collapse', 'type', 'orientation', 'heading'] })}>
          <p>Sed et laborum.</p>
        </drgn-accordion-item>
      </drgn-accordion>
      `,
    };
  },
};
