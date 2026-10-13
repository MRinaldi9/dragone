import type { Injector, ViewContainerRef } from '@angular/core';
import type { NgpDismissGuard } from 'ng-primitives/portal';
import type { Observable } from 'rxjs';

import type { MaybeSignal, StatusType } from '@dragone/ui/utils';

/** Panel width variant. `small` is 360px, `large` is 600px (Sirio "Dialog" page). */
export type DialogSize = 'small' | 'large';

/** Valid ARIA roles for a dialog panel. */
export type DialogRole = 'dialog' | 'alertdialog';

/** Configuration for {@link DynamicDialog.open}. */
export interface DynamicDialogConfig {
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
 * Reference to a dialog opened with {@link DynamicDialog.open}. `DynamicDialog.open()` and every
 * `injectDynamicDialogRef()` call inside the Dialog Body Component resolve to the same instance.
 */
export interface DynamicDialogRef<R = unknown> {
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
  /**
   * Closes the dialog, resolving {@link afterClosed} with the optional result.
   *
   * Declared as a method, not a function-typed property, on purpose: method signatures are checked
   * bivariantly, so the per-dialog cache can store and return `DynamicDialogRef<R>` as
   * `DynamicDialogRef<unknown>` without casts. As a property signature `close` would make
   * `DynamicDialogRef` invariant in `R`.
   */
  close(result?: R): Promise<void>;
}
