import {
  Component,
  InjectionToken,
  effect,
  inject,
  isSignal,
  viewChild,
  ViewContainerRef,
  inputBinding,
  outputBinding,
  type Binding,
  type ComponentRef,
  type Type
} from '@angular/core';
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
import type { MaybeSignal } from '@dragone/ui/utils';
import { Status, type StatusType } from '@dragone/ui/utils';

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

/** Everything the shell needs to render one dialog opened via `Dialog.open()`. */
export interface DialogShellContext<T = unknown> {
  /** The Dialog Body Component rendered inside the panel. */
  readonly component: Type<T>;
  /** The dialog title, rendered as the panel heading. */
  readonly title: string;
  /** Optional description rendered under the title; becomes `aria-describedby`. */
  readonly description?: string;
  /** Panel width variant: `small` (360px) or `large` (600px). */
  readonly size: 'small' | 'large';
  /** Semantic status driving the header icon and its color. */
  readonly status: StatusType;
  /** Accessible name of the close icon button. */
  readonly closeButtonLabel: string;
  /** Inputs applied to the body component; values may be signals. */
  readonly inputs?: Record<string, MaybeSignal<unknown>>;
  /** Output listeners applied to the body component. */
  readonly outputs?: Record<string, (event: unknown) => void>;
}

export const DIALOG_SHELL_CONTEXT = new InjectionToken<DialogShellContext>(
  'DrgnDialogShellContext'
);

/**
 * Private Component: the dialog skeleton (scrim, panel, status icon, title, description, close
 * action, dynamic body). Never exported — consumers drive it through the `Dialog` service.
 */
@Component({
  selector: 'drgn-dialog-shell',
  imports: [NgIcon, NgpDialog, NgpDialogDescription, NgpDialogTitle, Button, Status],
  template: `
    <div
      class="dialog-panel"
      ngpDialog
      [drgnStatus]="context.status"
      [attr.data-size]="context.size"
    >
      <button
        drgnButton
        type="button"
        class="dialog-close"
        semantic="ghost"
        iconOnly
        [ariaLabel]="context.closeButtonLabel"
        (click)="close()"
      >
        <ng-icon size="16" name="faSolidXmark" />
      </button>
      <ng-icon size="24" class="dialog-icon" data-testid="dialog-status-icon" [svg]="statusIcon" />
      <h2 class="drgn-h4-md dialog-title" ngpDialogTitle>{{ context.title }}</h2>
      @if (context.description) {
        <p class="drgn-p-md-01 dialog-description" ngpDialogDescription>
          {{ context.description }}
        </p>
      }
      <ng-container #bodyHost />
    </div>
  `,
  styleUrl: './dialog-shell.css',
  providers: [provideIcons({ faSolidXmark })],
  host: {
    // The scrim only exists for modal dialogs: non-modal dialogs keep the page pointer-interactive
    // (transparent, pointer-events: none — see the stylesheet) while `aria-modal` is false. This
    // removes the scrim and the pointer block only: focus stays trapped (upstream NgpDialog always
    // applies NgpFocusTrap) — see `DialogConfig.modal`.
    '[attr.data-modal]': 'modal ? "true" : "false"',
    // Test hook: the scrim is only reachable by coordinates, never by role or text.
    'data-testid': 'dialog-overlay'
  },
  hostDirectives: [NgpDialogOverlay]
})
export class DialogShell {
  protected readonly context = inject(DIALOG_SHELL_CONTEXT);
  protected readonly statusIcon = STATUS_TO_ICON[this.context.status];

  readonly #dialogConfig = injectDialogConfig();
  /** Per-dialog config injected by the manager; the same source `NgpDialog` reads for `aria-modal`. */
  protected readonly modal = this.#dialogConfig.modal ?? true;

  readonly #dialogRef = inject(NgpDialogRef);
  private readonly bodyHost = viewChild.required('bodyHost', { read: ViewContainerRef });
  private bodyRef: ComponentRef<unknown> | null = null;

  constructor() {
    effect(() => {
      if (this.bodyRef) {
        return;
      }
      // Created inside the shell's view so the body resolves the dialog injector: it can
      // `injectDialogRef()` and close itself with a result.
      this.bodyRef = this.bodyHost().createComponent(this.context.component, {
        bindings: this.createBindings()
      });
    });
  }

  /**
   * Declarative, template-like bindings for the body component: signal inputs stay reactive through
   * the framework's binding machinery (no manual `setInput`), plain values are bound through a
   * constant getter, and output listeners are the programmatic analog of template event bindings.
   */
  private createBindings(): Binding[] {
    const { inputs, outputs } = this.context;
    const bindings: Binding[] = [];

    for (const [name, value] of Object.entries(inputs ?? {})) {
      // `inputBinding` reads its value through a getter: a signal is its own getter, any other
      // value (functions included) is wrapped in a constant one.
      bindings.push(inputBinding(name, isSignal(value) ? value : () => value));
    }
    for (const [name, listener] of Object.entries(outputs ?? {})) {
      bindings.push(outputBinding(name, listener));
    }

    return bindings;
  }

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
