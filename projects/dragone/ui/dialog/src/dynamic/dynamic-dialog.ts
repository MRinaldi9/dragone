import { Injector, Service, inject, type InjectOptions, type Type } from '@angular/core';
import { NgpDialogManager, NgpDialogRef } from 'ng-primitives/dialog';
import { map, type Observable } from 'rxjs';

import type { DynamicDialogConfig, DynamicDialogRef } from '../models/dialog.model';
import {
  DIALOG_SHELL_CONTEXT,
  DialogShell,
  type DialogShellContext
} from '../ui/dialog-shell/dialog-shell';

/**
 * Backing implementation of {@link DynamicDialogRef}. Deliberately not exported: consumers depend on
 * the interface, so the upstream `NgpDialogRef` never appears in the public types.
 */
class DynamicDialogRefImpl<R> implements DynamicDialogRef<R> {
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
 * One {@link DynamicDialogRef} per underlying dialog, so `DynamicDialog.open()` and
 * `injectDynamicDialogRef()` hand out the same handle (the upstream ref is the shared key: the
 * dialog injector provides the same `NgpDialogRef` instance everywhere).
 */
const dynamicDialogRefs = new WeakMap<NgpDialogRef<unknown, unknown>, DynamicDialogRef<unknown>>();

function dynamicDialogRefFor<R>(ref: NgpDialogRef<unknown, R>): DynamicDialogRef<R> {
  const key = ref as NgpDialogRef<unknown, unknown>;
  const existing = dynamicDialogRefs.get(key);
  if (existing) {
    return existing as DynamicDialogRef<R>;
  }

  const dialogRef = new DynamicDialogRefImpl(ref);
  dynamicDialogRefs.set(key, dialogRef);
  return dialogRef;
}

/**
 * Injects the {@link DynamicDialogRef} of the dialog the calling component is rendered in. Usable
 * inside a Dialog Body Component opened via {@link DynamicDialog.open} to close itself and return a
 * result.
 */
export function injectDynamicDialogRef<R = unknown>(
  options?: InjectOptions & { optional?: false }
): DynamicDialogRef<R>;
export function injectDynamicDialogRef<R = unknown>(
  options: InjectOptions & { optional: true }
): DynamicDialogRef<R> | null;
export function injectDynamicDialogRef<R = unknown>(
  options?: InjectOptions
): DynamicDialogRef<R> | null {
  const ref = inject(NgpDialogRef<unknown, R>, options ?? {});
  // `inject` yields null only with `optional: true` outside a dialog, which the caller opted into.
  return ref ? dynamicDialogRefFor(ref) : null;
}

/**
 * Opens dialogs programmatically: the caller provides a Dialog Body Component that is created
 * inside the dialog skeleton (scrim, panel, status icon, title, description, close action).
 *
 * ```ts
 * const ref = inject(DynamicDialog).open(ConfirmBody, {
 *   title: 'Pubblica questo articolo?',
 *   inputs: { articleId: signal(42) },
 * });
 * ref.afterClosed.subscribe(result => ...);
 * ```
 */
@Service()
export class DynamicDialog {
  readonly #manager = inject(NgpDialogManager);
  readonly #injector = inject(Injector);

  /**
   * Opens a dialog rendering `component` as its body and returns a {@link DynamicDialogRef}. The
   * body component can inject {@link injectDynamicDialogRef} to close the dialog and return a
   * result.
   */
  open<R = unknown>(component: Type<unknown>, config: DynamicDialogConfig): DynamicDialogRef<R> {
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

    return dynamicDialogRefFor(ref);
  }
}
