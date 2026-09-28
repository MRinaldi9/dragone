import {
  argsToTemplate,
  moduleMetadata,
  type Meta,
  type StoryObj
} from '@analogjs/storybook-angular';
import { Component, signal } from '@angular/core';
import { expect, waitFor } from 'storybook/test';

import { Announcer, injectAnnouncerState, sleep } from '@dragone/ui/utils';

import { Busy } from './busy/busy';
import { LoaderOverlay } from './overlay/loader-overlay';
import { Spinner } from './spinner/spinner';

/**
 * Completion pattern demo: the trigger persists, so focus returns to it and completion is announced
 * separately (location via focus, state change via the live region — never the same text twice).
 * Disabling the trigger while loading drops focus on `<body>` in Chromium, hence the explicit
 * restore. When the trigger is gone instead, focus the loaded content heading (`tabindex="-1"`) and
 * skip the announcement — the focused heading announces itself.
 */
@Component({
  selector: 'drgn-loader-complete-demo',
  imports: [LoaderOverlay, Busy],
  template: `
    <main [drgnBusy]="loading()">
      <button #reloadBtn type="button" [disabled]="loading()" (click)="reload(reloadBtn)">
        Ricarica contenuti
      </button>
    </main>
    @if (loading()) {
      <drgn-loader-overlay label="Ricaricamento contenuti" />
    } @else {
      <p>Contenuti aggiornati.</p>
    }
  `,
  hostDirectives: [Announcer]
})
class LoaderCompleteDemo {
  readonly loading = signal(false);
  readonly announcer = injectAnnouncerState();

  async reload(trigger: HTMLButtonElement): Promise<void> {
    this.loading.set(true);
    await sleep(300);
    this.loading.set(false);
    trigger.focus();
    this.announcer().announce('Contenuti aggiornati');
  }
}

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
  decorators: [moduleMetadata({ imports: [LoaderOverlay, LoaderCompleteDemo, Busy] })],
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
    const content = canvas.getByRole('main');
    await expect(content).toHaveAttribute('aria-busy', 'true');
    expect(content.inert).toBe(true);
  },
  render: args => ({
    props: args,
    template: `
      <main [drgnBusy]="true">
        <p>Page content stays visible under the veil but is not interactive.</p>
        <button type="button">Unreachable while loading</button>
      </main>
      <drgn-loader-overlay ${argsToTemplate(args)} />
    `
  })
};

export const LoadingComplete: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Recommended completion pattern: while loading, the background is `inert` + `aria-busy` ' +
          'and the overlay shows a status; on completion focus returns to the trigger (which ' +
          'persists) and the `Announcer` reports the state change. When the trigger is gone, ' +
          'focus the loaded heading (`tabindex="-1"`) instead and skip the announcement.'
      }
    }
  },
  play: async ({ canvas, userEvent }) => {
    const reload = canvas.getByRole('button', { name: 'Ricarica contenuti' });
    await userEvent.click(reload);
    await expect(canvas.getByRole('status', { name: 'Ricaricamento contenuti' })).toBeVisible();
    await waitFor(() => expect(canvas.queryByRole('status')).toBeNull());
    expect(canvas.getByText('Contenuti aggiornati.')).toBeVisible();
    await expect(reload).toHaveFocus();
  },
  render: () => ({
    template: ` <drgn-loader-complete-demo /> `
  })
};
