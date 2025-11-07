import type { Meta, StoryObj } from '@analogjs/storybook-angular';
import { argsToTemplate } from '@analogjs/storybook-angular';
import { expect, fn, within } from 'storybook/test';
import { Switch } from './switch';

type SwitchArgs = {
  checked: boolean;
  disabled: boolean;
  checkedChange: (checked: boolean) => void;
  darkMode?: boolean;
  ariaLabel?: string;
};

const meta: Meta<SwitchArgs> = {
  title: 'Dragone/UI/Switch',
  component: Switch,
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Controlla se lo switch è attivo o meno',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabilita lo switch impedendo interazioni',
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
  args: {
    ariaLabel: 'switch',
  },
  render: args => ({
    props: args,
    template: `
      <drgn-switch aria-label="Switch" ${argsToTemplate(args, { exclude: ['darkMode'] })}></drgn-switch>
    `,
  }),
};

export default meta;
type Story = StoryObj<SwitchArgs>;

/**
 * Switch di default in stato non selezionato.
 */
export const Default: Story = {
  args: {
    checked: false,
    disabled: false,
    checkedChange: fn(),
  },
};

/**
 * Switch in stato checked (attivo).
 */
export const Checked: Story = {
  args: {
    ...Default.args,
    checked: true,
  },
};

/**
 * Switch in stato disabilitato, non interagibile.
 */
export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchElement = canvas.getByRole('switch');

    // Verifica che lo switch sia disabilitato
    await expect(switchElement).toHaveAttribute('aria-disabled', 'true');
    await expect(switchElement).toHaveAttribute('data-disabled');
  },
};

/**
 * Switch disabilitato in stato checked.
 */
export const DisabledChecked: Story = {
  args: {
    ...Default.args,
    checked: true,
    disabled: true,
  },
};

/**
 * Test di interazione: verifica che lo switch cambi stato al click.
 */
export const InteractionTest: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const switchElement = canvas.getByRole('switch');

    // Stato iniziale: non checked
    await expect(switchElement).toHaveAttribute('aria-checked', 'false');
    await expect(switchElement).not.toHaveAttribute('data-checked');

    // Click per attivare
    await userEvent.click(switchElement);

    // Verifica stato checked
    await expect(switchElement).toHaveAttribute('aria-checked', 'true');
    await expect(switchElement).toHaveAttribute('data-checked');

    // Click per disattivare
    await userEvent.click(switchElement);

    // Verifica stato non checked
    await expect(switchElement).toHaveAttribute('aria-checked', 'false');
    await expect(switchElement).not.toHaveAttribute('data-checked');
  },
};

/**
 * Test di accessibilità: verifica la navigazione da tastiera.
 */
export const KeyboardNavigation: Story = {
  play: async ({ canvasElement, userEvent, step }) => {
    const canvas = within(canvasElement);
    const switchElement = canvas.getByRole('switch');

    // Focus con Tab
    await userEvent.tab();
    await expect(switchElement).toHaveFocus();
    await expect(switchElement).toHaveAttribute('data-focus-visible');

    // Stato iniziale
    await expect(switchElement).toHaveAttribute('aria-checked', 'false');

    await step('Uso con Space', async () => {
      // Attiva con Space
      await userEvent.keyboard(' ');
      await expect(switchElement).toHaveAttribute('aria-checked', 'true');

      // Disattiva con Space
      await userEvent.keyboard(' ');
      await expect(switchElement).toHaveAttribute('aria-checked', 'false');
    });

    await step('Uso con Enter', async () => {
      await userEvent.keyboard('{Enter}');
      await expect(switchElement).toHaveAttribute('aria-checked', 'true');

      await userEvent.keyboard('{Enter}');
      await expect(switchElement).toHaveAttribute('aria-checked', 'false');
    });
  },
};

/**
 * Variante con label personalizzata.
 * Mostra come usare lo switch insieme a una label per migliorare l'accessibilità.
 */
export const WithLabel: Story = {
  render: args => ({
    props: args,
    template: `
      <div style="padding: 2rem;">
        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
          <drgn-switch ${argsToTemplate(args)}></drgn-switch>
          <span style="font-family: var(--typography-global-font-family-01); font-size: var(--typography-global-font-size-04);">
            Abilita notifiche
          </span>
        </label>
      </div>
    `,
  }),
};
