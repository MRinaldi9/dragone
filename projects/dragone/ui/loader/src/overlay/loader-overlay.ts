import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, inject, input } from '@angular/core';

import { Spinner, type SpinnerSize } from '../spinner/spinner';

// Intentionally not built on ng-primitives/dialog: an overlay loader has no
// interactive content, so a dialog focus trap would create a keyboard trap
// (WCAG 2.1.2). Blocking is functional via scroll-lock here plus consumer-side
// `inert`/`aria-busy` on the content below (see the Overlay story).
@Component({
  selector: 'drgn-loader-overlay',
  imports: [Spinner],
  template: ` <drgn-spinner [label]="label()" [size]="size()" /> `,
  styleUrl: './loader-overlay.css'
})
export class LoaderOverlay {
  /**
   * Accessible name forwarded to the inner spinner. Do not pass an empty string: the status would
   * be left without an accessible name.
   *
   * @default 'Caricamento in corso'
   */
  readonly label = input('Caricamento in corso');
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
