import { argsToTemplate, type Meta, type StoryObj } from '@analogjs/storybook-angular';

import { ChipSelected } from './chip-selected';

type ChipSelectedArgs = ChipSelected & {
  checked: boolean;
  disabled: boolean;
  checkedChange: (checked: boolean) => void;
  label: string;
};

const meta: Meta<ChipSelectedArgs> = {
  title: 'Dragone/UI/Chip/Selected',
  component: ChipSelected,
  tags: ['autodocs'],
  args: {
    label: 'Chips',
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Testo visualizzato nella chip',
    },
    checked: {
      control: 'boolean',
      description: 'Stato di selezione della chip',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabilita la chip impedendo interazioni',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    checkedChange: {
      action: 'selectedChange',
      description: 'Evento emesso quando lo stato selected cambia',
      table: { type: { summary: 'EventEmitter<boolean>' } },
    },
    hidden: {
      control: 'boolean',
      description: 'Nasconde la chip',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    name: {
      control: 'text',
      description: "Nome della chip, utile per l'identificazione in un gruppo di chip",
      table: { type: { summary: 'string' } },
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
    checked: true,
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
    checked: true,
    disabled: true,
  },
};
