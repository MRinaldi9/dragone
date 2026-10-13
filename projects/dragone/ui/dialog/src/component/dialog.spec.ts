import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { faSolidCircleExclamation } from '@ng-icons/font-awesome/solid';
import { render } from '@wismaz/vitest-browser-angular';
import { NgpDialogManager } from 'ng-primitives/dialog';
import { firstValueFrom } from 'rxjs';
import { page, userEvent } from 'vitest/browser';

import type { StatusType } from '@dragone/ui/utils';

import type { DialogSize } from '../models/dialog.model';
import { Dialog } from './dialog';

@Component({
  selector: 'drgn-dialog-declarative-host',
  imports: [Dialog],
  template: `
    <drgn-dialog
      title="Titolo finestra di dialogo"
      description="Descrizione della finestra"
      [size]="size()"
      [status]="status()"
      [modal]="modal()"
      [(open)]="open"
    >
      <p data-testid="dialog-content">Contenuto proiettato</p>
    </drgn-dialog>
  `
})
class DeclarativeHost {
  readonly open = signal(false);
  readonly size = signal<DialogSize>('small');
  readonly status = signal<StatusType>('neutral');
  readonly modal = signal(true);
}

describe(Dialog, () => {
  const renderDialog = async () => render(DeclarativeHost);

  afterEach(async () => {
    const manager = TestBed.inject(NgpDialogManager);
    if (manager.openDialogs.length > 0) {
      manager.closeAll();
      await firstValueFrom(manager.afterAllClosed);
    }
  });

  it('renders the projected content and the title when open becomes true', async () => {
    const { componentClassInstance: host } = await renderDialog();
    expect(page.getByRole('dialog').elements()).toHaveLength(0);

    host.open.set(true);

    await expect
      .element(page.getByRole('dialog', { name: 'Titolo finestra di dialogo' }))
      .toBeInTheDocument();
    await expect
      .element(page.getByTestId('dialog-content'))
      .toHaveTextContent('Contenuto proiettato');
    await expect.element(page.getByText('Descrizione della finestra')).toBeInTheDocument();
  });

  it('forwards the panel inputs', async () => {
    const { componentClassInstance: host } = await renderDialog();
    host.size.set('large');
    host.status.set('warning');
    host.open.set(true);

    await expect.element(page.getByRole('dialog')).toHaveAttribute('data-size', 'large');
    await expect.element(page.getByRole('dialog')).toHaveAttribute('data-status', 'warning');
    await expect
      .element(page.getByTestId('dialog-status-icon'))
      .toContainHTML(faSolidCircleExclamation);
  });

  it('closes and writes back to the two-way binding from the close button', async () => {
    const { componentClassInstance: host } = await renderDialog();
    host.open.set(true);
    await expect.element(page.getByRole('dialog')).toBeInTheDocument();

    await userEvent.click(page.getByRole('button', { name: 'Chiudi' }));

    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    expect(host.open()).toBeFalsy();
  });

  it('closes and writes back to the two-way binding on escape', async () => {
    const { componentClassInstance: host } = await renderDialog();
    host.open.set(true);
    await expect.element(page.getByRole('dialog')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    expect(host.open()).toBeFalsy();
  });

  it('opens and closes from the consumer binding', async () => {
    const { componentClassInstance: host } = await renderDialog();

    host.open.set(true);
    await expect.element(page.getByRole('dialog')).toBeInTheDocument();

    host.open.set(false);
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders a non-modal dialog without scrim and with aria-modal false', async () => {
    const { componentClassInstance: host } = await renderDialog();
    host.modal.set(false);
    host.open.set(true);

    await expect.element(page.getByTestId('dialog-overlay')).toHaveAttribute('data-modal', 'false');
    await expect.element(page.getByRole('dialog')).toHaveAttribute('aria-modal', 'false');
  });

  it('closes its dialog when the host is destroyed', async () => {
    const { componentClassInstance: host, fixture } = await renderDialog();
    host.open.set(true);
    await expect.element(page.getByRole('dialog')).toBeInTheDocument();

    fixture.destroy();

    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });
});
