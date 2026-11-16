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
import { Status, TestId, type StatusType } from '@dragone/ui/utils';

import type { DialogSize } from '../../models/dialog.model';

// Status icons per the Sirio "Dialog / Semantic" Penpot page (warning uses a circle exclamation
// and danger uses a triangle, unlike Alert).
const STATUS_TO_ICON = {
  neutral: faSolidCircleInfo,
  info: faSolidCircleInfo,
  success: faSolidCircleCheck,
  warning: faSolidCircleExclamation,
  danger: faSolidTriangleExclamation
} as const;

/**
 * Shared dialog skeleton (scrim, panel, status icon, title, description, close button, and
 * projected content) used by both `Dialog` and `DynamicDialog`.
 */
@Component({
  selector: 'drgn-dialog-panel',
  imports: [NgIcon, NgpDialog, NgpDialogDescription, NgpDialogTitle, Button, Status, TestId],
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
      <ng-icon size="24" class="dialog-icon" drgnTestId="dialog-status-icon" [svg]="statusIcon()" />
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
    '[attr.data-modal]': 'modal ? "true" : "false"'
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

  protected readonly modal = injectDialogConfig().modal ?? true;

  readonly #dialogRef = inject(NgpDialogRef);

  // Honors `disableClose` like escape and scrim click; `NgpDialogRef.close()` closes unconditionally.
  protected close(): void {
    if (this.#dialogRef.disableClose) {
      return;
    }
    this.#dialogRef.close();
  }
}
