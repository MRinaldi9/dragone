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

import type { MaybeSignal, StatusType } from '@dragone/ui/utils';

import type { DialogSize } from '../../models/dialog.model';
import { DialogPanel } from '../dialog-panel/dialog-panel';

/** Everything the shell needs to render one dialog opened via `DynamicDialog.open()`. */
export interface DialogShellContext<T = unknown> {
  /** The Dialog Body Component rendered inside the panel. */
  readonly component: Type<T>;
  /** The dialog title, rendered as the panel heading. */
  readonly title: string;
  /** Optional description rendered under the title; becomes `aria-describedby`. */
  readonly description?: string;
  /** Panel width variant: `small` (360px) or `large` (600px). */
  readonly size: DialogSize;
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
 * Private Component: the service's adapter over the shared `DialogPanel` skeleton. It maps the
 * per-dialog context onto the panel inputs and creates the Dialog Body Component into the panel's
 * projected slot. Never exported.
 */
@Component({
  selector: 'drgn-dialog-shell',
  imports: [DialogPanel],
  template: `
    <drgn-dialog-panel
      [title]="context.title"
      [description]="context.description"
      [size]="context.size"
      [status]="context.status"
      [closeButtonLabel]="context.closeButtonLabel"
    >
      <ng-container #bodyHost />
    </drgn-dialog-panel>
  `,
  styleUrl: './dialog-shell.css'
})
export class DialogShell {
  protected readonly context = inject(DIALOG_SHELL_CONTEXT);

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
}
