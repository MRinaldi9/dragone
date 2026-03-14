import { type Meta, type StoryObj } from '@analogjs/storybook-angular';
import { fn } from 'storybook/test';
import { ChipInput } from './chip-input';
import { faSolidUser } from '@ng-icons/font-awesome/solid';

const meta: Meta<ChipInput> = {
  title: 'Dragone/UI/Chip/Input',
  component: ChipInput,
  tags: ['autodocs'],
  args: {
    label: 'Chips',
    remove: fn(),
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Testo visualizzato nella chip.',
    },
    icon: {
      control: 'text',
      description: 'Mostra un esempio di icona SVG inline prima della label.',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
    },
    remove: {
      action: 'remove',
      description: 'Evento emesso quando si clicca il pulsante di rimozione.',
      table: { type: { summary: 'EventEmitter<void>' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabilita la chip, rendendola non interattiva.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: false } },
    },
  },
  render: args => ({
    props: {
      ...args,
    },
    template: `
      <drgn-chip-input
        [label]="label"
        [disabled]="disabled"
        ${args.icon ? '[icon]="icon"' : ''}
        (remove)="remove()"
      ></drgn-chip-input>
    `,
  }),
};

export default meta;
type Story = StoryObj<ChipInput>;

export const Default: Story = {};

export const WithIcon: Story = {
  args: {
    icon: faSolidUser,
  },
};

export const LongLabel: Story = {
  args: {
    label: 'Richiesta assistenza previdenziale',
  },
};
