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

import type { StatusType } from '@dragone/ui/utils';

import type { DialogSize } from '../models/dialog.model';
import { DialogPanel } from '../ui/dialog-panel/dialog-panel';

/**
 * Declarative dialog: author the content in markup and drive opening with a two-way `open` binding.
 *
 * ```html
 * <drgn-dialog [(open)]="confirmOpen" title="Pubblica questo articolo?" size="small">
 *   <p class="drgn-p-md-01">L'azione è irreversibile.</p>
 * </drgn-dialog>
 * ```
 *
 * The content is projected into the shared Dialog Panel; the dialog itself is portaled by
 * `NgpDialogManager`, so it inherits focus trap, escape/outside-click handling, scroll blocking and
 * `aria-hidden` bookkeeping from the primitive. For a dynamically created body component use
 * `DynamicDialog` instead.
 */
@Component({
  selector: 'drgn-dialog',
  imports: [DialogPanel],
  template: `
    <ng-template #content>
      <drgn-dialog-panel
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
   * Whether the dialog is modal. Modal dialogs show the scrim and set `aria-modal="true"`;
   * non-modal dialogs keep the page pointer-interactive and set `aria-modal="false"`.
   *
   * Known limitations, both upstream in `NgpDialog`/`NgpDialogManager` and not fixable through the
   * public API:
   *
   * - Focus stays trapped inside the panel even when non-modal: `NgpDialog` always applies
   *   `NgpFocusTrap` and does not derive it from `modal` (the trap arms unconditionally; its
   *   `disabled` input only skips the initial focus and is not exposed). Keyboard users therefore
   *   cannot leave a "non-modal" dialog.
   * - Page scroll is blocked while any dialog is open, including non-modal ones.
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
