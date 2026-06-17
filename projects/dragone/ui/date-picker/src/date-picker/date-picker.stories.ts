import {
  argsToTemplate,
  moduleMetadata,
  type Meta,
  type StoryObj,
} from '@analogjs/storybook-angular';
import { provideDateAdapter } from 'ng-primitives/date-time';

import { FORMAT_DATE } from '../format-date';
import { TemporalAdapter } from '../temporal-adapter';
import { DatePicker } from './date-picker';

const meta: Meta<DatePicker> = {
  title: 'Dragone/UI/DatePicker',
  component: DatePicker,
  args: {
    value: Temporal.Now.plainDateTimeISO(),
  },
  argTypes: {
    value: {
      table: {
        disable: true,
      },
    },
  },
  decorators: [
    moduleMetadata({
      providers: [
        provideDateAdapter(TemporalAdapter),
        {
          provide: FORMAT_DATE,
          useValue: {
            locale: 'it-IT',
            options: {
              month: '2-digit',
              year: 'numeric',
            },
          },
        },
      ],
    }),
  ],
  tags: ['autodocs'],
  render: args => ({
    props: args,
    template: `
      <drgn-date-picker ${argsToTemplate(args)}/>
    `,
  }),
};

export default meta;
type Story = StoryObj<DatePicker>;

export const Default: Story = {};
