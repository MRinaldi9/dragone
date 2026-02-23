import { argsToTemplate, type Meta, type StoryObj } from '@analogjs/storybook-angular';
import { fn } from 'storybook/test';
import { ChipSelected } from './chip-selected';

type ChipSelectedArgs = {
  selected: boolean;
  disabled: boolean;
  label: string;
  selectedChange: (selected: boolean) => void;
};

const meta: Meta<ChipSelectedArgs> = {
  title: 'Dragone/UI/Chip/Selected',
  component: ChipSelected,
  tags: ['autodocs'],
  args: {
    label: 'Chips',
    selected: false,
    disabled: false,
    selectedChange: fn(),
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Testo visualizzato nella chip',
    },
    selected: {
      control: 'boolean',
      description: 'Stato di selezione della chip',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabilita la chip impedendo interazioni',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    selectedChange: {
      action: 'selectedChange',
      description: 'Evento emesso quando lo stato selected cambia',
      table: { type: { summary: 'EventEmitter<boolean>' } },
    },
  },
  render: args => ({
    props: args,
    template: `
			<button
				drgn-chip-selected
				aria-label="${args.label}"
				${argsToTemplate(args, { exclude: ['label'] })}
			>
				${args.label}
			</button>
		`,
  }),
};

export default meta;
type Story = StoryObj<ChipSelectedArgs>;

/**
 * Chip non selezionata.
 */
export const Default: Story = {};

/**
 * Chip selezionata.
 */
export const Selected: Story = {
  args: {
    selected: true,
  },
};

/**
 * Chip disabilitata.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

/**
 * Chip selezionata e disabilitata.
 */
export const DisabledSelected: Story = {
  args: {
    selected: true,
    disabled: true,
  },
};
