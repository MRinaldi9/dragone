import {
  argsToTemplate,
  moduleMetadata,
  type Meta,
  type StoryObj
} from '@analogjs/storybook-angular';
import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { expect, screen, userEvent, waitFor } from 'storybook/test';

import { Button } from '@dragone/ui/button';
import type { StatusType } from '@dragone/ui/utils';

import { Dialog, injectDialogRef, type DialogSize } from './dialog';

/**
 * Dialog Body Component example: free content plus the actions area. The design's "Action" variant
 * stacks full-width buttons on Small and lays them out in a row on Large — the body owns that
 * layout, not the skeleton.
 */
@Component({
  selector: 'drgn-dialog-demo-body',
  imports: [Button],
  template: `
    <p class="drgn-p-md-01 demo-body-text">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua.
    </p>
    <footer class="demo-actions">
      <button drgnButton type="button" semantic="secondary" (click)="close(false)">Annulla</button>
      <button drgnButton type="button" (click)="close(true)">Conferma</button>
    </footer>
  `,
  styles: `
    .demo-actions {
      display: flex;
      gap: 24px;
    }
  `
})
class DemoBody {
  readonly #dialog = injectDialogRef();

  close(result: boolean): void {
    this.#dialog.close(result);
  }
}

/**
 * Body that renders a signal input and exposes an output: the demo shows the input value staying in
 * sync with the host signal while the dialog is open, and the output writing back into it.
 */
@Component({
  selector: 'drgn-dialog-demo-counter-body',
  imports: [Button],
  template: `
    <p class="drgn-p-md-01" data-testid="dialog-counter">Body: {{ count() }}</p>
    <button drgnButton type="button" (click)="countChange.emit(100)">Porta a 100</button>
  `
})
class DemoCounterBody {
  readonly count = input(0);
  readonly countChange = output<number>();
}

@Component({
  selector: 'drgn-dialog-demo',
  imports: [Button],
  template: `
    <button drgnButton type="button" (click)="open()">Apri finestra di dialogo</button>
    @if (resultText(); as text) {
      <p data-testid="dialog-result">{{ text }}</p>
    }
  `
})
class DialogDemo {
  readonly title = input('Titolo finestra di dialogo');
  readonly description = input<string | undefined>(undefined);
  readonly size = input<DialogSize>('small');
  readonly status = input<StatusType>('neutral');
  readonly modal = input(true);

  readonly #dialog = inject(Dialog);
  protected readonly resultText = signal<string | null>(null);

  open(): void {
    const ref = this.#dialog.open(DemoBody, {
      title: this.title(),
      description: this.description(),
      size: this.size(),
      status: this.status(),
      modal: this.modal()
    });

    firstValueFrom(ref.afterClosed).then(result =>
      this.resultText.set(`Risultato: ${result === undefined ? 'chiusura' : result}`)
    );
  }
}

@Component({
  selector: 'drgn-dialog-reactive-demo',
  imports: [Button],
  template: `
    <button drgnButton type="button" (click)="open()">Apri finestra di dialogo reattiva</button>
    <p class="drgn-p-md-01" data-testid="reactive-host-count">Host: {{ count() }}</p>
  `,
  styles: `
    /* The Storybook wrapper centers its content in the viewport; pin the host controls to the top
       so the host value stays visible next to the (centered) dialog and the sync is observable. */
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
      align-self: flex-start;
    }
  `
})
class ReactiveDemo {
  protected readonly count = signal(0);

  readonly #dialog = inject(Dialog);
  readonly #destroyRef = inject(DestroyRef);
  #timer: ReturnType<typeof setInterval> | null = null;

  open(): void {
    this.count.set(0);
    // Non-modal: the page keeps updating behind the dialog, so the host signal (and the value it
    // pushes into the body through the input binding) stays observable while the dialog is open.
    const ref = this.#dialog.open(DemoCounterBody, {
      title: 'Contatore reattivo',
      modal: false,
      inputs: { count: this.count },
      outputs: { countChange: value => this.align(value) }
    });

    this.#timer = setInterval(() => this.count.update(value => value + 1), 1000);
    firstValueFrom(ref.closed).then(() => this.stop());
    this.#destroyRef.onDestroy(() => this.stop());
  }

  /** The body asked to align: stop ticking and write the signal the input binding reads. */
  private align(value: unknown): void {
    if (typeof value !== 'number') {
      return;
    }
    this.stop();
    this.count.set(value);
  }

  private stop(): void {
    if (this.#timer !== null) {
      clearInterval(this.#timer);
      this.#timer = null;
    }
  }
}

const meta: Meta<Dialog> = {
  title: 'Dragone/UI/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  args: {
    title: 'Titolo finestra di dialogo',
    description: 'Descrizione facoltativa della finestra di dialogo.',
    size: 'small',
    status: 'neutral',
    modal: true
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    size: {
      options: ['small', 'large'],
      control: { type: 'select' },
      table: { defaultValue: { summary: 'small' } }
    },
    status: {
      options: ['neutral', 'info', 'success', 'warning', 'danger'],
      control: { type: 'select' },
      table: { defaultValue: { summary: 'neutral' } }
    },
    modal: {
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } }
    }
  },
  decorators: [
    moduleMetadata({ imports: [Button, DemoBody, DemoCounterBody, DialogDemo, ReactiveDemo] })
  ]
};

export default meta;
type Story = StoryObj<DialogDemo>;

export const Default: Story = {
  render: args => ({
    props: args,
    template: `<drgn-dialog-demo ${argsToTemplate(args)} />`
  }),
  play: async ({ canvas, step }) => {
    await step('opens the dialog from the service', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Apri finestra di dialogo' }));
      // The dialog is portaled into document.body, outside the story canvas: `screen`
      // (document.body-scoped) is the locator that can see it.
      await waitFor(() => {
        expect(screen.getByRole('dialog', { name: 'Titolo finestra di dialogo' })).toBeVisible();
      });
    });
    await step('closes it from the close button', async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Chiudi' }));
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  }
};

export const Large: Story = {
  args: { size: 'large' },
  render: args => ({
    props: args,
    template: `<drgn-dialog-demo ${argsToTemplate(args)} />`
  })
};

export const Warning: Story = {
  args: { status: 'warning' },
  render: args => ({
    props: args,
    template: `<drgn-dialog-demo ${argsToTemplate(args)} />`
  })
};

export const NonModal: Story = {
  args: { modal: false },
  render: args => ({
    props: args,
    template: `<drgn-dialog-demo ${argsToTemplate(args)} />`
  })
};

export const WithResult: Story = {
  render: args => ({
    props: args,
    template: `<drgn-dialog-demo ${argsToTemplate({ ...args, description: undefined })} />`
  }),
  play: async ({ canvas, step }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Apri finestra di dialogo' }));
    await step('the body closes with a typed result', async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Conferma' }));
      await waitFor(() => {
        expect(canvas.getByTestId('dialog-result')).toHaveTextContent('Risultato: true');
      });
    });
  }
};

/**
 * Shows the two-way seam of the programmatic API:
 *
 * - The input binding keeps the body in sync with the host signal (the host increments it every
 *   second and both sides display the same value);
 * - The output binding writes back into the same host signal (the body aligns the host to 100, and
 *   that value travels back into the body through the input binding).
 *
 * Non-modal so the host value stays visible (and the page keeps updating) next to the dialog.
 */
export const ReactiveInputs: Story = {
  render: () => ({
    template: `<drgn-dialog-reactive-demo />`
  }),
  play: async ({ canvas, step }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'Apri finestra di dialogo reattiva' })
    );

    // Comparing the two rendered values instead of an absolute number keeps the assertion
    // independent of which tick the polling catches.
    const syncSnapshot = (): { host: number; body: number } => ({
      host: Number(canvas.getByTestId('reactive-host-count').textContent?.match(/\d+/)?.[0]),
      body: Number(screen.getByTestId('dialog-counter').textContent?.match(/\d+/)?.[0])
    });

    await step('the body stays in sync with the host signal bound to its input', async () => {
      await waitFor(
        () => {
          const { host, body } = syncSnapshot();
          expect(body).toBeGreaterThan(0);
          expect(host).toBe(body);
        },
        { timeout: 4000 }
      );
    });

    await step('the body output writes back into the same host signal', async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Porta a 100' }));
      await waitFor(() => {
        const { host, body } = syncSnapshot();
        expect(body).toBe(100);
        expect(host).toBe(100);
      });
    });
  }
};
