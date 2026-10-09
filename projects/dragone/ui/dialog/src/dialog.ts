import {
  Injectable,
  Injector,
  inject,
  type InjectOptions,
  type Type,
  type ViewContainerRef
} from '@angular/core';
import { NgpDialogManager, NgpDialogRef } from 'ng-primitives/dialog';
import type { NgpDismissGuard } from 'ng-primitives/portal';
import { map, type Observable } from 'rxjs';

import type { MaybeSignal, StatusType } from '@dragone/ui/utils';

import {
  DIALOG_SHELL_CONTEXT,
  DialogShell,
  type DialogShellContext
} from './dialog-shell/dialog-shell';

/** Panel width variant. `small` is 360px, `large` is 600px (Sirio "Dialog" page). */
export type DialogSize = 'small' | 'large';

/** Valid ARIA roles for a dialog panel. */
export type DialogRole = 'dialog' | 'alertdialog';

/** Configuration for {@link Dialog.open}. */
export interface DialogConfig {
  /** The dialog title; Sirio always renders one. Becomes the panel heading and accessible name. */
  title: string;
  /** Optional description rendered under the title; becomes `aria-describedby` of the panel. */
  description?: string;
  /**
   * The panel width variant.
   *
   * @default 'small'
   */
  size?: DialogSize;
  /**
   * The semantic status driving the header icon and its color. `neutral` renders the info icon with
   * the primary color.
   *
   * @default 'neutral'
   */
  status?: StatusType;
  /**
   * Accessible name of the close icon button.
   *
   * @default 'Chiudi'
   */
  closeButtonLabel?: string;
  /**
   * Inputs applied to the Dialog Body Component through declarative `inputBinding`s: signal values
   * stay reactive while the dialog is open (framework-managed, like a template binding), plain
   * values are bound once. This replaces the classic CDK-style `data` bag: the body declares its
   * payload as typed inputs instead.
   */
  inputs?: Record<string, MaybeSignal<unknown>>;
  /**
   * Output listeners applied to the Dialog Body Component through declarative `outputBinding`s —
   * the programmatic analog of template event bindings. The listener receives the emitted value as
   * `unknown`; narrow it inside the listener.
   */
  outputs?: Record<string, (event: unknown) => void>;
  /** ID of the dialog. If omitted, a unique one is generated. */
  id?: string;
  /**
   * The ARIA role of the dialog panel.
   *
   * @default 'dialog'
   */
  role?: DialogRole;
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
  modal?: boolean;
  /** The element or selector the dialog is rendered into. `null` means the document body. */
  container?: HTMLElement | string | null;
  /** Whether the dialog closes on escape, or a guard function. */
  closeOnEscape?: NgpDismissGuard<KeyboardEvent>;
  /** Whether the dialog closes when clicking the scrim, or a guard function. */
  closeOnOutsideClick?: NgpDismissGuard<Element>;
  /**
   * Whether the dialog closes on router navigation.
   *
   * @default true
   */
  closeOnNavigation?: boolean;
  /** Parent injector for the dialog content; the Dialog Body Component resolves from it. */
  injector?: Injector;
  /**
   * View container the dialog content is created from. Optional: when the app is bootstrapped
   * normally the manager resolves it from the root component; tests (TestBed keeps
   * `ApplicationRef.components` empty) can pass one, or an `injector` that provides it.
   */
  viewContainerRef?: ViewContainerRef;
}

/**
 * Reference to a dialog opened with {@link Dialog.open}. `Dialog.open()` and every
 * `injectDialogRef()` call inside the Dialog Body Component resolve to the same instance.
 */
export interface DialogRef<R = unknown> {
  /** Unique ID of the dialog. */
  readonly id: string;
  /**
   * When set, user-initiated closing (escape, scrim click, close button) is blocked. Programmatic
   * `close()` is not affected.
   */
  disableClose: boolean | undefined;
  /** Emits the result as soon as the dialog is closed, before the exit animation runs. */
  readonly closed: Observable<R | undefined>;
  /** Emits the result after the exit animation completed and the dialog left the DOM. */
  readonly afterClosed: Observable<R | undefined>;
  /** Keyboard events dispatched from inside the dialog. */
  readonly keydownEvents: Observable<KeyboardEvent>;
  /** Pointer events dispatched outside the dialog while it is open. */
  readonly outsidePointerEvents: Observable<MouseEvent>;
  /** Closes the dialog, resolving {@link afterClosed} with the optional result. */
  close(result?: R): Promise<void>;
}

/**
 * Backing implementation of {@link DialogRef}. Deliberately not exported: consumers depend on the
 * interface, so the upstream `NgpDialogRef` never appears in the public types.
 */
class DialogRefImpl<R> implements DialogRef<R> {
  readonly #ref: NgpDialogRef<unknown, R>;

  constructor(ref: NgpDialogRef<unknown, R>) {
    this.#ref = ref;
  }

  get id(): string {
    return this.#ref.id;
  }

  get disableClose(): boolean | undefined {
    return this.#ref.disableClose;
  }

  set disableClose(value: boolean | undefined) {
    this.#ref.disableClose = value;
  }

  get closed(): Observable<R | undefined> {
    return this.#ref.closed.pipe(map(event => event.result));
  }

  get afterClosed(): Observable<R | undefined> {
    return this.#ref.afterClosed;
  }

  get keydownEvents(): Observable<KeyboardEvent> {
    return this.#ref.keydownEvents;
  }

  get outsidePointerEvents(): Observable<MouseEvent> {
    return this.#ref.outsidePointerEvents;
  }

  close(result?: R): Promise<void> {
    return this.#ref.close(result);
  }
}

/**
 * One {@link DialogRef} per underlying dialog, so `Dialog.open()` and `injectDialogRef()` hand out
 * the same handle (the upstream ref is the shared key: the dialog injector provides the same
 * `NgpDialogRef` instance everywhere).
 */
const dialogRefs = new WeakMap<NgpDialogRef<unknown, unknown>, DialogRef<unknown>>();

function dialogRefFor<R>(ref: NgpDialogRef<unknown, R>): DialogRef<R> {
  const key = ref as NgpDialogRef<unknown, unknown>;
  const existing = dialogRefs.get(key);
  if (existing) {
    return existing as DialogRef<R>;
  }

  const dialogRef = new DialogRefImpl(ref);
  dialogRefs.set(key, dialogRef);
  return dialogRef;
}

/**
 * Injects the {@link DialogRef} of the dialog the calling component is rendered in. Usable inside a
 * Dialog Body Component opened via {@link Dialog.open} to close itself and return a result.
 */
export function injectDialogRef<R = unknown>(
  options?: InjectOptions & { optional?: false }
): DialogRef<R>;
export function injectDialogRef<R = unknown>(
  options: InjectOptions & { optional: true }
): DialogRef<R> | null;
export function injectDialogRef<R = unknown>(options?: InjectOptions): DialogRef<R> | null {
  const ref = inject(NgpDialogRef<unknown, R>, options ?? {});
  // `inject` yields null only with `optional: true` outside a dialog, which the caller opted into.
  return ref ? dialogRefFor(ref) : null;
}

/**
 * Opens dialogs programmatically: the caller provides a Dialog Body Component that is created
 * inside the dialog skeleton (scrim, panel, status icon, title, description, close action).
 *
 * ```ts
 * const ref = inject(Dialog).open(ConfirmBody, {
 *   title: 'Pubblica questo articolo?',
 *   inputs: { articleId: signal(42) },
 * });
 * ref.afterClosed.subscribe(result => ...);
 * ```
 */
@Injectable({ providedIn: 'root' })
export class Dialog {
  readonly #manager = inject(NgpDialogManager);
  readonly #injector = inject(Injector);

  /**
   * Opens a dialog rendering `component` as its body and returns a {@link DialogRef}. The body
   * component can inject {@link injectDialogRef} to close the dialog and return a result.
   */
  open<R = unknown>(component: Type<unknown>, config: DialogConfig): DialogRef<R> {
    const {
      title,
      description,
      size,
      status,
      closeButtonLabel,
      inputs,
      outputs,
      ...managerConfig
    } = config;

    const context = {
      component,
      title,
      description,
      size: size ?? 'small',
      status: status ?? 'neutral',
      closeButtonLabel: closeButtonLabel ?? 'Chiudi',
      inputs,
      outputs
    } satisfies DialogShellContext;

    // The shell reads its rendering context from this injector; the manager chains it into the
    // dialog injector, so the body component resolves both the context and the NgpDialogRef.
    const injector = Injector.create({
      parent: managerConfig.injector ?? this.#injector,
      providers: [{ provide: DIALOG_SHELL_CONTEXT, useValue: context }]
    });

    // The upstream overloads cannot express a typed result without a required `data` property,
    // so the untyped overload result is narrowed here.
    const ref = this.#manager.open(DialogShell, {
      ...managerConfig,
      injector
    }) as NgpDialogRef<unknown, R>;

    return dialogRefFor(ref);
  }
}
