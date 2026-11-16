import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, inject, input } from '@angular/core';

import {
  coerceSpinnerLabel,
  Spinner,
  SPINNER_DEFAULT_LABEL,
  type SpinnerSize
} from '../spinner/spinner';

// Intentionally not built on ng-primitives/dialog: an overlay loader has no
// interactive content, so a dialog focus trap would create a keyboard trap
// (WCAG 2.1.2). Blocking is functional via scroll-lock here plus consumer-side
// `inert`/`aria-busy` on the content below (see the Overlay story).
/**
 * Fullscreen blocking loader that locks page scroll and blocks pointer interaction. Pair it with
 * `[drgnBusy]` on background content, restore focus after loading, and announce completion via
 * `drgnAnnouncer`.
 */
@Component({
  selector: 'drgn-loader-overlay',
  imports: [Spinner],
  template: ` <drgn-spinner [label]="label()" [size]="size()" /> `,
  styleUrl: './loader-overlay.css'
})
export class LoaderOverlay {
  /**
   * Accessible name forwarded to the inner spinner. Empty or blank values fall back to the default
   * via {@link coerceSpinnerLabel}.
   *
   * @default 'Caricamento in corso'
   */
  readonly label = input(SPINNER_DEFAULT_LABEL, { transform: coerceSpinnerLabel });
  /** The size forwarded to the inner spinner. */
  readonly size = input<SpinnerSize>('medium');

  readonly #body = inject(DOCUMENT).body;
  readonly #destroyRef = inject(DestroyRef);
  readonly #previousOverflow = this.#body.style.overflow;

  constructor() {
    this.#body.style.overflow = 'hidden';
    this.#destroyRef.onDestroy(() => (this.#body.style.overflow = this.#previousOverflow));
  }
}
