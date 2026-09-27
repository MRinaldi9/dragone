import {
  argsToTemplate,
  moduleMetadata,
  type Meta,
  type StoryObj
} from '@analogjs/storybook-angular';
import { expect } from 'storybook/test';

import { LoaderOverlay } from './overlay/loader-overlay';
import { Spinner } from './spinner/spinner';

const meta: Meta<Spinner> = {
  title: 'Dragone/UI/Loader',
  component: Spinner,
  tags: ['autodocs'],
  args: {
    label: 'Caricamento in corso',
    size: 'medium'
  },
  argTypes: {
    label: {
      description: 'Accessible name announced when loading starts',
      control: 'text',
      table: {
        defaultValue: { summary: 'Caricamento in corso' }
      }
    },
    size: {
      description: 'The size of the spinner',
      options: ['small', 'medium', 'large'],
      control: { type: 'select' },
      table: {
        defaultValue: { summary: 'medium' }
      }
    }
  },
  decorators: [moduleMetadata({ imports: [LoaderOverlay] })],
  parameters: {
    docs: {
      description: {
        component:
          'Indeterminate loading indicator. ' +
          'The overlay blocks pointer interaction with a fullscreen veil and locks the page scroll; ' +
          'consumers must also apply `inert` and `aria-busy` to the content below so keyboard and ' +
          'screen-reader users cannot reach it while loading.'
      }
    }
  }
};

export default meta;
type Story = StoryObj<Spinner>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status', { name: 'Caricamento in corso' })).toBeVisible();
  },
  render: args => ({
    props: args,
    template: ` <drgn-spinner ${argsToTemplate(args)} /> `
  })
};

export const CustomLabel: Story = {
  args: {
    label: 'Salvataggio bozza'
  },
  render: args => ({
    props: args,
    template: ` <drgn-spinner ${argsToTemplate(args)} /> `
  })
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; align-items: center; gap: 2rem;">
        <drgn-spinner size="small" label="Caricamento piccolo" />
        <drgn-spinner size="medium" label="Caricamento medio" />
        <drgn-spinner size="large" label="Caricamento grande" />
      </div>
    `
  })
};

export const Overlay: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status', { name: 'Caricamento in corso' })).toBeVisible();
    await expect(document.body.style.overflow).toBe('hidden');
  },
  render: args => ({
    props: args,
    template: `
      <main [inert]="true" aria-busy="true">
        <p>Page content stays visible under the veil but is not interactive.</p>
        <button type="button">Unreachable while loading</button>
      </main>
      <drgn-loader-overlay ${argsToTemplate(args)} />
    `
  })
};
