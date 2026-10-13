import {
  argsToTemplate,
  moduleMetadata,
  type Meta,
  type StoryObj
} from '@analogjs/storybook-angular';
import { Component, input, signal } from '@angular/core';
import { expect, screen, userEvent, waitFor } from 'storybook/test';

import { Button } from '@dragone/ui/button';
import type { StatusType } from '@dragone/ui/utils';

import { Dialog } from './dialog';
import type { DialogSize } from './dialog.model';

/**
 * Declarative demo: the content is authored in markup and the dialog is driven by a two-way `open`
 * binding. The rendered `Aperta:` line mirrors the binding, so the write-back is observable.
 */
@Component({
  selector: 'drgn-dialog-declarative-demo',
  imports: [Button, Dialog],
  template: `
    <button drgnButton type="button" (click)="open.set(true)">Apri finestra di dialogo</button>
    <p class="drgn-p-md-01" data-testid="dialog-open-state">Aperta: {{ open() }}</p>
    <drgn-dialog
      [title]="title()"
      [description]="description()"
      [size]="size()"
      [status]="status()"
      [modal]="modal()"
      [(open)]="open"
    >
      <p class="drgn-p-md-01">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua.
      </p>
      <footer class="demo-actions">
        <button drgnButton type="button" semantic="secondary" (click)="open.set(false)">
          Annulla
        </button>
        <button drgnButton type="button" (click)="open.set(false)">Conferma</button>
      </footer>
    </drgn-dialog>
  `,
  styles: `
    .demo-actions {
      display: flex;
      gap: 24px;
    }
  `
})
class DeclarativeDemo {
  readonly title = input('Titolo finestra di dialogo');
  readonly description = input<string | undefined>(undefined);
  readonly size = input<DialogSize>('small');
  readonly status = input<StatusType>('neutral');
  readonly modal = input(true);
  readonly open = signal(false);
}

const meta: Meta<Dialog> = {
  title: 'Dragone/UI/Dialog/Component',
  component: Dialog,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Declarative dialog: the content is authored in markup and projected into the shared ' +
          'dialog panel, while `[(open)]` drives opening and closing. The component renders nothing ' +
          'inline — it portals its own template through `NgpDialogManager`, so the projected ' +
          'content inherits the primitive focus trap, escape/outside-click handling, scroll ' +
          'blocking and `aria-hidden` bookkeeping. Closing from the dialog itself (escape, scrim, ' +
          'close button) writes back into the `open` binding. Prefer it when the body is known at ' +
          'build time; for a body component chosen at runtime use `Dragone/UI/Dialog/Service`.'
      }
    }
  },
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
  decorators: [moduleMetadata({ imports: [Button, DeclarativeDemo] })]
};

export default meta;
type Story = StoryObj<DeclarativeDemo>;

export const Default: Story = {
  render: args => ({
    props: args,
    template: `<drgn-dialog-declarative-demo ${argsToTemplate(args)} />`
  }),
  play: async ({ canvas, step }) => {
    await step('opens from the [(open)] binding', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Apri finestra di dialogo' }));
      // The dialog is portaled into document.body, outside the story canvas: `screen`
      // (document.body-scoped) is the locator that can see it.
      await waitFor(() => {
        expect(screen.getByRole('dialog', { name: 'Titolo finestra di dialogo' })).toBeVisible();
      });
    });
    await step('closes from the projected action and syncs the binding', async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Conferma' }));
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
    template: `<drgn-dialog-declarative-demo ${argsToTemplate(args)} />`
  })
};

export const Warning: Story = {
  args: { status: 'warning' },
  render: args => ({
    props: args,
    template: `<drgn-dialog-declarative-demo ${argsToTemplate(args)} />`
  })
};

export const NonModal: Story = {
  args: { modal: false },
  render: args => ({
    props: args,
    template: `<drgn-dialog-declarative-demo ${argsToTemplate(args)} />`
  })
};

/**
 * The dialog closing itself (here: escape) writes back into the consumer's `open` signal — the
 * rendered state line follows.
 */
export const TwoWayBinding: Story = {
  render: args => ({
    props: args,
    template: `<drgn-dialog-declarative-demo ${argsToTemplate(args)} />`
  }),
  play: async ({ canvas, step }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Apri finestra di dialogo' }));
    await step('the consumer state reflects the open dialog', async () => {
      await waitFor(() => {
        expect(canvas.getByTestId('dialog-open-state')).toHaveTextContent('Aperta: true');
      });
    });
    await step('escape closes the dialog and the binding follows', async () => {
      await userEvent.keyboard('{Escape}');
      await waitFor(() => {
        expect(canvas.getByTestId('dialog-open-state')).toHaveTextContent('Aperta: false');
      });
    });
  }
};
