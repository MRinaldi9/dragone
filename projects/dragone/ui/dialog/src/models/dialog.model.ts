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
   * Inputs bound to the Dialog Body Component; signal values stay reactive while the dialog is
   * open.
   */
  inputs?: Record<string, MaybeSignal<unknown>>;
  /**
   * Output listeners bound to the Dialog Body Component; each callback receives the emitted value
   * as `unknown`.
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
   * Whether the dialog is modal (`aria-modal="true"` with a blocking scrim).
   *
   * @default true
   */
  // Upstream NgpDialog/NgpDialogManager limitation: focus trapping and page scroll lock remain
  // active even when `modal` is false.
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
  /** Optional `ViewContainerRef` used to create the dialog content. */
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
  /** Closes the dialog, resolving {@link afterClosed} with the optional result. */
  // Method syntax is used so TypeScript checks `R` bivariantly in the per-dialog ref cache.
  close(result?: R): Promise<void>;
}
