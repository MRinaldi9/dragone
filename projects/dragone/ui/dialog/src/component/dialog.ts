import {
  Component,
  DestroyRef,
  Injector,
  TemplateRef,
  effect,
  inject,
  input,
  model,
  viewChild
} from '@angular/core';
import { NgpDialogManager, type NgpDialogRef } from 'ng-primitives/dialog';

import { TestId, type StatusType } from '@dragone/ui/utils';

import type { DialogSize } from '../models/dialog.model';
import { DialogPanel } from '../ui/dialog-panel/dialog-panel';

/**
 * Declarative dialog controlled by a two-way `[(open)]` binding; use `DynamicDialog` instead when
 * the body is a dynamically created component:
 *
 * ```html
 * <drgn-dialog [(open)]="confirmOpen" title="Pubblica questo articolo?" size="small">
 *   <p class="drgn-p-md-01">L'azione è irreversibile.</p>
 * </drgn-dialog>
 * ```
 */
@Component({
  selector: 'drgn-dialog',
  imports: [DialogPanel, TestId],
  template: `
    <ng-template #content>
      <drgn-dialog-panel
        drgnTestId="dialog-overlay"
        [title]="title()"
        [description]="description()"
        [size]="size()"
        [status]="status()"
        [closeButtonLabel]="closeButtonLabel()"
      >
        <ng-content />
      </drgn-dialog-panel>
    </ng-template>
  `,
  styleUrl: './dialog.css'
})
export class Dialog {
  /**
   * Whether the dialog is open. Two-way: `[(open)]` keeps the consumer's signal in sync when the
   * dialog closes itself (escape, scrim click, close button).
   *
   * @default false
   */
  readonly open = model(false);
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
   * The semantic status driving the header icon and its color.
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
  /**
   * Whether the dialog is modal (`aria-modal="true"` with a blocking scrim).
   *
   * @default true
   */
  readonly modal = input(true);

  private readonly content = viewChild.required('content', { read: TemplateRef });
  private readonly manager = inject(NgpDialogManager);
  private readonly injector = inject(Injector);
  private ref: NgpDialogRef | null = null;

  constructor() {
    effect(() => {
      const shouldOpen = this.open();
      if (shouldOpen && !this.ref) {
        this.#open();
      } else if (!shouldOpen && this.ref) {
        this.ref.close();
      }
    });

    // The dialog is portaled outside this component's view: without this it would outlive its
    // owner (e.g. when a route destroys the host while the dialog is open).
    inject(DestroyRef).onDestroy(() => this.ref?.close());
  }

  #open(): void {
    const ref = this.manager.open(this.content(), {
      // The element injector gives the manager a ViewContainerRef fallback when no root component
      // is bootstrapped (tests) — the same path `NgpDialogTrigger` uses.
      injector: this.injector,
      modal: this.modal()
    });

    this.ref = ref;
    // `closed` fires as soon as the close starts (before the exit animation) so the two-way binding
    // never reports an open dialog that is already gone.
    ref.closed.subscribe(() => {
      this.ref = null;
      this.open.set(false);
    });
  }
}
