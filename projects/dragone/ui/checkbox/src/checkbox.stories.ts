import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Checkbox } from './checkbox';

type CheckboxArgs = {
  checked: boolean;
  disabled: boolean;
  darkMode: boolean;
  checkedChange: (checked: boolean) => void;
  indeterminateChange: (indeterminate: boolean) => void;
};

const meta: Meta<CheckboxArgs> = {
  title: 'Dragone/UI/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Controlla se il checkbox è selezionato',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabilita il checkbox impedendo interazioni',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    checkedChange: {
      action: 'checkedChange',
      description: 'Evento emesso quando lo stato checked cambia',
      table: {
        type: { summary: 'EventEmitter<boolean>' },
      },
    },
  },
  render: args => ({
    props: args,
    template: `<drgn-checkbox aria-label="Checkbox" ${argsToTemplate(args, { exclude: ['darkMode'] })}/>`,
  }),
};

export default meta;
type Story = StoryObj<CheckboxArgs>;

/**
 * Checkbox di default in stato non selezionato.
 */
export const Default: Story = {
  args: {
    checked: false,
    disabled: false,
    checkedChange: fn(),
  },
};

/**
 * Checkbox in stato checked (selezionato).
 */
export const Checked: Story = {
  args: {
    ...Default.args,
    checked: true,
  },
};

/**
 * Checkbox in stato disabilitato, non interagibile.
 */
export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkboxElement = canvas.getByRole('checkbox');

    // Verifica che il checkbox sia disabilitato
    await expect(checkboxElement).toHaveAttribute('aria-disabled', 'true');
    await expect(checkboxElement).toHaveAttribute('data-disabled');
  },
};

/**
 * Checkbox disabilitato in stato checked.
 */
export const DisabledChecked: Story = {
  args: {
    ...Default.args,
    checked: true,
    disabled: true,
  },
};

/**
 * Test di interazione: verifica che il checkbox cambi stato al click.
 */
export const InteractionTest: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkboxElement = canvas.getByRole('checkbox');

    // Stato iniziale: non checked
    await expect(checkboxElement).toHaveAttribute('aria-checked', 'false');
    await expect(checkboxElement).not.toHaveAttribute('data-checked');

    // Click per selezionare
    await userEvent.click(checkboxElement);

    // Verifica stato checked
    await expect(checkboxElement).toHaveAttribute('aria-checked', 'true');
    await expect(checkboxElement).toHaveAttribute('data-checked');

    // Click per deselezionare
    await userEvent.click(checkboxElement);

    // Verifica stato non checked
    await expect(checkboxElement).toHaveAttribute('aria-checked', 'false');
    await expect(checkboxElement).not.toHaveAttribute('data-checked');
  },
};

/**
 * Test di accessibilità: verifica la navigazione da tastiera.
 */
export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkboxElement = canvas.getByRole('checkbox');

    // Focus con Tab
    await userEvent.tab();
    await expect(checkboxElement).toHaveFocus();
    await expect(checkboxElement).toHaveAttribute('data-focus-visible');

    // Stato iniziale
    await expect(checkboxElement).toHaveAttribute('aria-checked', 'false');

    // Seleziona con Space
    await userEvent.keyboard(' ');
    await expect(checkboxElement).toHaveAttribute('aria-checked', 'true');

    // Deseleziona con Space
    await userEvent.keyboard(' ');
    await expect(checkboxElement).toHaveAttribute('aria-checked', 'false');
  },
};
