import {
  argsToTemplate,
  moduleMetadata,
  type Meta,
  type StoryObj,
} from '@analogjs/storybook-angular';

import { TemporalAdapter } from '@dragone/ui/temporal-adapter';

import { DatePicker } from './date-picker';
import { provideDragoneDatePickerConfig } from './providers/date-picker-config';

type MetaDatePicker = DatePicker<Temporal.PlainDateTime> & {
  value: Temporal.PlainDateTime;
  valueChange: (value: Temporal.PlainDateTime) => void;
  min: Temporal.PlainDateTime;
  max: Temporal.PlainDateTime;
  dateDisabled: (value: Temporal.PlainDateTime) => boolean;
};

const meta: Meta<MetaDatePicker> = {
  title: 'Dragone/UI/DatePicker',
  component: DatePicker,
  argTypes: {
    value: {
      control: { type: 'date' },
      description: 'The current date value of the date picker.',
    },
    min: {
      control: { type: 'date' },
      description: 'The minimum selectable date of the date picker.',
    },
    max: {
      control: { type: 'date' },
      description: 'The maximum selectable date of the date picker.',
    },
    dateDisabled: {
      type: 'function',
      description: 'Function to determine if a date should be disabled.',
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
      providers: [provideDragoneDatePickerConfig({ adapter: TemporalAdapter })],
    }),
  ],
  tags: ['autodocs'],
  render: args => ({
    props: args,
    template: `
        <drgn-date-picker [(value)]="value" ${argsToTemplate(args, { exclude: ['value'] })} />
      `,
  }),
};

export default meta;
type Story = StoryObj<MetaDatePicker>;

export const Default: Story = {
  args: {
    // Value: Temporal.PlainDateTime.from({ year: 2024, month: 1, day: 1 }),
    keepInvalid: true,
  },
};

export const WithMinMax: Story = {
  args: {
    min: Temporal.PlainDateTime.from({ year: 2024, month: 1, day: 1 }),
    max: Temporal.PlainDateTime.from({ year: 2024, month: 12, day: 31 }),
  },
};

export const WithDisableDate: Story = {
  // Function inputs cannot travel through Storybook args: the Angular
  // `cleanArgsDecorator` strips every arg without a `control`/`action` in its
  // argType, and `inferControls` never infers a control for `type: 'function'`.
  // Bind the function directly in the render props instead.
  render: () => ({
    props: {
      disableWeekends: (date: Temporal.PlainDateTime) =>
        date.dayOfWeek === 6 || date.dayOfWeek === 7,
    },
    template: `<drgn-date-picker [dateDisabled]="disableWeekends" />`,
  }),
};
