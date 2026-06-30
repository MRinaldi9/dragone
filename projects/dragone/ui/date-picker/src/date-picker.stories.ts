import { moduleMetadata, type Meta, type StoryObj } from '@analogjs/storybook-angular';
import { provideDateAdapter } from 'ng-primitives/date-time';

import { TemporalAdapter } from '@dragone/ui/temporal-adapter';

import { DatePicker } from './date-picker';

type MetaDatePicker = DatePicker<Temporal.PlainDateTime> & {
  value: Temporal.PlainDateTime;
  valueChange: (value: Temporal.PlainDateTime) => void;
};

const meta: Meta<MetaDatePicker> = {
  title: 'Dragone/UI/DatePicker',
  component: DatePicker,
  argTypes: {
    value: {
      table: {
        disable: true,
      },
    },
    keepInvalid: {
      control: 'boolean',
      description:
        'If true, the input will keep the invalid value instead of reverting to the last valid value.',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
    locale: {
      control: 'text',
      description: 'The locale used to determine the date format and separators.',
      table: {
        defaultValue: { summary: 'it-IT' },
      },
    },
    options: {
      control: 'object',
      description: 'The Intl.DateTimeFormat options used to determine the date format.',
      table: {
        defaultValue: {
          summary: JSON.stringify({
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }),
        },
      },
    },
    valueChange: {
      description: 'Event emitted when the date value changes.',
      type: 'function',
    },
  },
  decorators: [
    moduleMetadata({
      providers: [provideDateAdapter(TemporalAdapter)],
    }),
  ],
  tags: ['autodocs'],
  render: args => ({
    props: args,
    template: `
      <drgn-date-picker [(value)]="value" [keepInvalid]="keepInvalid"/>
    `,
  }),
};

export default meta;
type Story = StoryObj<MetaDatePicker>;

export const Default: Story = {
  args: {
    // Value: Temporal.PlainDateTime.from({ year: 2024, month: 6, day: 1 }),
    keepInvalid: true,
  },
};
