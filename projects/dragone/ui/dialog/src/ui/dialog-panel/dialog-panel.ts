import { Component, computed, inject, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCircleCheck,
  faSolidCircleExclamation,
  faSolidCircleInfo,
  faSolidTriangleExclamation,
  faSolidXmark
} from '@ng-icons/font-awesome/solid';
import {
  NgpDialog,
  NgpDialogDescription,
  NgpDialogOverlay,
  NgpDialogRef,
  NgpDialogTitle,
  injectDialogConfig
} from 'ng-primitives/dialog';

import { Button } from '@dragone/ui/button';
import { Status, type StatusType } from '@dragone/ui/utils';

import type { DialogSize } from '../../models/dialog.model';

/**
 * Status icon per the Sirio "Dialog / Semantic" Penpot page. Deliberately different from Alert: the
 * dialog design uses a filled circle exclamation for `warning` and a filled triangle for `danger`.
 * `success` has no dialog variant in the design and falls back to the Alert icon.
 */
const STATUS_TO_ICON = {
  neutral: faSolidCircleInfo,
  info: faSolidCircleInfo,
  success: faSolidCircleCheck,
  warning: faSolidCircleExclamation,
  danger: faSolidTriangleExclamation
} as const;

/**
 * Private Component: the dialog skeleton shared by both APIs — the scrim (`NgpDialogOverlay` host),
 * the panel, the status icon, the title, the description, the close action and the projected
 * content. Not exported: consumers drive it through the `Dialog` component or the `DynamicDialog`
 * service.
 *
 * It must be instantiated inside the dialog injector (portaled by the manager), which is what makes
 * `NgpDialogRef` and the per-dialog config resolvable.
 */
@Component({
  selector: 'drgn-dialog-panel',
  imports: [NgIcon, NgpDialog, NgpDialogDescription, NgpDialogTitle, Button, Status],
  template: `
    <div class="dialog-panel" ngpDialog [drgnStatus]="status()" [attr.data-size]="size()">
      <button
        drgnButton
        type="button"
        class="dialog-close"
        semantic="ghost"
        iconOnly
        [ariaLabel]="closeButtonLabel()"
        (click)="close()"
      >
        <ng-icon size="16" name="faSolidXmark" />
      </button>
      <ng-icon
        size="24"
        class="dialog-icon"
        data-testid="dialog-status-icon"
        [svg]="statusIcon()"
      />
      <h2 class="drgn-h4-md dialog-title" ngpDialogTitle>{{ title() }}</h2>
      @if (description()) {
        <p class="drgn-p-md-01 dialog-description" ngpDialogDescription>{{ description() }}</p>
      }
      <ng-content />
    </div>
  `,
  styleUrl: './dialog-panel.css',
  providers: [provideIcons({ faSolidXmark })],
  host: {
    // The scrim only exists for modal dialogs: non-modal dialogs keep the page pointer-interactive
    // (transparent, pointer-events: none — see the stylesheet) while `aria-modal` is false. This
    // removes the scrim and the pointer block only: focus stays trapped (upstream NgpDialog always
    // applies NgpFocusTrap) — see `DialogConfig.modal` / `Dialog.modal`.
    '[attr.data-modal]': 'modal ? "true" : "false"',
    // Test hook: the scrim is only reachable by coordinates, never by role or text.
    'data-testid': 'dialog-overlay'
  },
  hostDirectives: [NgpDialogOverlay]
})
export class DialogPanel {
  /** The dialog title; Sirio always renders one. Becomes the panel heading and accessible name. */
  readonly title = input.required<string>();
  /** Optional description rendered under the title; becomes `aria-describedby` of the panel. */
  readonly description = input<string>();
  /**
   * The panel width variant.
   *
   * @default 'small'
   */
  readonly size = input<DialogSize>('small');
  /**
   * The semantic status driving the header icon and its color. `neutral` renders the info icon with
   * the primary color.
   *
   * @default 'neutral'
   */
  readonly status = input<StatusType>('neutral');
  /**
   * Accessible name of the close icon button.
   *
   * @default 'Chiudi'
   */
  readonly closeButtonLabel = input('Chiudi');

  protected readonly statusIcon = computed(() => STATUS_TO_ICON[this.status()]);

  /** Per-dialog config injected by the manager; the same source `NgpDialog` reads for `aria-modal`. */
  protected readonly modal = injectDialogConfig().modal ?? true;

  readonly #dialogRef = inject(NgpDialogRef);

  /**
   * The close button honors `disableClose` like escape and scrim click do; the underlying
   * `NgpDialogRef.close()` would otherwise close unconditionally.
   */
  protected close(): void {
    if (this.#dialogRef.disableClose) {
      return;
    }
    this.#dialogRef.close();
  }
}
