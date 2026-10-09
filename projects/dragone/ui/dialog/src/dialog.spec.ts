import { Component, Injector, inject, input, output, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  faSolidCircleCheck,
  faSolidCircleExclamation,
  faSolidCircleInfo,
  faSolidTriangleExclamation
} from '@ng-icons/font-awesome/solid';
import { render } from '@wismaz/vitest-browser-angular';
import { NgpDialogManager } from 'ng-primitives/dialog';
import { firstValueFrom } from 'rxjs';
import { page, userEvent } from 'vitest/browser';

import { Button } from '@dragone/ui/button';

import { Dialog, injectDialogRef, type DialogRef } from './dialog';

// Captured by the last Dialog Body Component created, so a test can compare the ref it injected
// with the one returned by `Dialog.open()`.
let capturedDialogRef: DialogRef<boolean> | null = null;

// Top-left corner of the fullscreen scrim: the panel is centered, so a click there lands on
// the overlay itself, not on the dialog. `x`/`y` are the locator API's key names.
// oxlint-disable id-length
const scrimCorner = { x: 2, y: 2 };
// oxlint-enable id-length

@Component({
  selector: 'drgn-dialog-test-body',
  imports: [Button],
  template: `
    <p data-testid="dialog-body-text">{{ message() }}</p>
    <button drgnButton type="button" (click)="confirm(true)">Conferma</button>
    <button drgnButton type="button" semantic="secondary" (click)="confirm(false)">Annulla</button>
    <button drgnButton type="button" semantic="ghost" (click)="selected.emit('item-42')">
      Seleziona
    </button>
  `
})
class TestBody {
  readonly message = input('initial');
  readonly selected = output<string>();
  readonly dialogRef = injectDialogRef<boolean>();

  constructor() {
    capturedDialogRef = this.dialogRef;
  }

  confirm(result: boolean): void {
    this.dialogRef.close(result);
  }
}

@Component({
  selector: 'drgn-dialog-test-host',
  template: ''
})
class TestHost {
  /**
   * Node injector of the host: TestBed keeps `ApplicationRef.components` empty, so the dialog
   * manager falls back to `config.injector` for its ViewContainerRef. The node injector provides
   * one — the same path `NgpDialogTrigger` uses in apps.
   */
  readonly injector = inject(Injector);
}

describe(Dialog, () => {
  let dialog: Dialog;
  let hostInjector: Injector;

  const renderDialog = async (): Promise<void> => {
    const { inject: injectFromFixture, componentClassInstance: host } = await render(TestHost);
    dialog = injectFromFixture(Dialog);
    hostInjector = host.injector;
  };

  /**
   * Dialogs attach to document.body and would leak into the next test's role queries. The manager
   * is destroyed on TestBed cleanup (which runs before the next test), so closing here keeps every
   * test starting from a clean DOM.
   */
  afterEach(async () => {
    const manager = TestBed.inject(NgpDialogManager);
    if (manager.openDialogs.length > 0) {
      manager.closeAll();
      await firstValueFrom(manager.afterAllClosed);
    }
  });

  it('renders the skeleton with title, description and the body component', async () => {
    await renderDialog();
    dialog.open(TestBody, {
      injector: hostInjector,
      title: 'Pubblica questo articolo?',
      description: "L'azione è irreversibile."
    });

    await expect
      .element(page.getByRole('dialog', { name: 'Pubblica questo articolo?' }))
      .toBeInTheDocument();
    await expect.element(page.getByText("L'azione è irreversibile.")).toBeInTheDocument();
    await expect.element(page.getByTestId('dialog-body-text')).toHaveTextContent('initial');
  });

  it('renders the default info icon and small size for a neutral dialog', async () => {
    await renderDialog();
    dialog.open(TestBody, { injector: hostInjector, title: 'Finestra di dialogo' });

    await expect.element(page.getByTestId('dialog-status-icon')).toContainHTML(faSolidCircleInfo);

    await expect.element(page.getByRole('dialog')).toHaveAttribute('data-size', 'small');
    await expect.element(page.getByRole('dialog')).not.toHaveAttribute('data-status');
  });

  it('renders the status icon and data-status per status', async () => {
    await renderDialog();
    dialog.open(TestBody, {
      injector: hostInjector,
      title: 'Finestra di dialogo',
      status: 'warning'
    });

    await expect
      .element(page.getByTestId('dialog-status-icon'))
      .toContainHTML(faSolidCircleExclamation);

    await expect.element(page.getByRole('dialog')).toHaveAttribute('data-status', 'warning');
  });

  it('renders the danger triangle icon per the dialog design (swapped versus Alert)', async () => {
    await renderDialog();
    dialog.open(TestBody, {
      injector: hostInjector,
      title: 'Finestra di dialogo',
      status: 'danger'
    });

    await expect
      .element(page.getByTestId('dialog-status-icon'))
      .toContainHTML(faSolidTriangleExclamation);
  });

  it('renders the success icon (no dialog variant in the design, aligned with Alert)', async () => {
    await renderDialog();
    dialog.open(TestBody, {
      injector: hostInjector,
      title: 'Finestra di dialogo',
      status: 'success'
    });

    await expect.element(page.getByTestId('dialog-status-icon')).toContainHTML(faSolidCircleCheck);
  });

  it('applies the large size variant', async () => {
    await renderDialog();
    dialog.open(TestBody, { injector: hostInjector, title: 'Finestra di dialogo', size: 'large' });

    await expect.element(page.getByRole('dialog')).toHaveAttribute('data-size', 'large');
  });

  it('propagates signal inputs to the body while the dialog stays open', async () => {
    await renderDialog();
    const message = signal('first');
    dialog.open(TestBody, {
      injector: hostInjector,
      title: 'Finestra di dialogo',
      inputs: { message }
    });

    await expect.element(page.getByTestId('dialog-body-text')).toHaveTextContent('first');
    message.set('second');
    await expect.element(page.getByTestId('dialog-body-text')).toHaveTextContent('second');
  });

  it('applies plain input values to the body', async () => {
    await renderDialog();
    dialog.open(TestBody, {
      injector: hostInjector,
      title: 'Finestra di dialogo',
      inputs: { message: 'valore statico' }
    });

    await expect.element(page.getByTestId('dialog-body-text')).toHaveTextContent('valore statico');
  });

  it('forwards body outputs to the config listeners', async () => {
    await renderDialog();
    const selected = vi.fn<(value: unknown) => void>();
    dialog.open(TestBody, {
      injector: hostInjector,
      title: 'Finestra di dialogo',
      outputs: { selected }
    });

    await userEvent.click(page.getByRole('button', { name: 'Seleziona' }));

    expect(selected).toHaveBeenCalledWith('item-42');
  });

  it('hands the body the same ref instance returned by open()', async () => {
    await renderDialog();
    capturedDialogRef = null;
    const ref = dialog.open<boolean>(TestBody, {
      injector: hostInjector,
      title: 'Finestra di dialogo'
    });

    // Wait for the body to be created (it is instantiated after the panel renders).
    await expect.element(page.getByTestId('dialog-body-text')).toBeInTheDocument();

    expect(capturedDialogRef).toBe(ref);
  });

  it('closes from the body with a typed result and emits it', async () => {
    await renderDialog();
    const ref = dialog.open<boolean>(TestBody, {
      injector: hostInjector,
      title: 'Finestra di dialogo'
    });
    // Subscribe before closing: `afterClosed` completes on close, and firstValueFrom on an
    // already-completed subject throws EmptyError.
    const result = firstValueFrom(ref.afterClosed);

    await userEvent.click(page.getByRole('button', { name: 'Conferma' }));

    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    await expect(result).resolves.toBeTruthy();
  });

  it('closes from the close button', async () => {
    await renderDialog();
    const ref = dialog.open(TestBody, { injector: hostInjector, title: 'Finestra di dialogo' });
    const result = firstValueFrom(ref.closed);

    await userEvent.click(page.getByRole('button', { name: 'Chiudi' }));

    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    await expect(result).resolves.toBeUndefined();
  });

  it('closes on escape', async () => {
    await renderDialog();
    dialog.open(TestBody, { injector: hostInjector, title: 'Finestra di dialogo' });

    await userEvent.keyboard('{Escape}');

    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes on scrim click', async () => {
    await renderDialog();
    dialog.open(TestBody, { injector: hostInjector, title: 'Finestra di dialogo' });

    // Click a corner of the fullscreen scrim: the panel is centered, so the pointer lands
    // on the overlay itself, not on the dialog.
    await page.getByTestId('dialog-overlay').click({ position: scrimCorner });

    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('stays open on scrim click when closeOnOutsideClick is false', async () => {
    await renderDialog();
    dialog.open(TestBody, {
      injector: hostInjector,
      title: 'Finestra di dialogo',
      closeOnOutsideClick: false
    });

    await page.getByTestId('dialog-overlay').click({ position: scrimCorner });

    await expect.element(page.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders a non-modal dialog without scrim and with aria-modal false', async () => {
    await renderDialog();
    dialog.open(TestBody, { injector: hostInjector, title: 'Finestra di dialogo', modal: false });

    await expect.element(page.getByTestId('dialog-overlay')).toHaveAttribute('data-modal', 'false');
    const overlay = page.getByTestId('dialog-overlay').element() as HTMLElement;
    expect(getComputedStyle(overlay).backgroundColor).toBe('rgba(0, 0, 0, 0)');

    await expect.element(page.getByRole('dialog')).toHaveAttribute('aria-modal', 'false');
  });

  it('blocks user-initiated closing while disableClose is set', async () => {
    await renderDialog();
    const ref = dialog.open(TestBody, { injector: hostInjector, title: 'Finestra di dialogo' });
    ref.disableClose = true;

    await userEvent.click(page.getByRole('button', { name: 'Chiudi' }));
    await expect.element(page.getByRole('dialog')).toBeInTheDocument();

    // Programmatic closing is not affected by disableClose.
    await ref.close();
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });
});
