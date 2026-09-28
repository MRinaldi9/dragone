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
 * Fullscreen blocking loader. The veil blocks pointer interaction and this component locks the page
 * scroll, but keyboard and screen-reader users can still reach the content below unless consumers
 * also block it with the `Busy` directive (`[drgnBusy]`, which sets `inert` and `aria-busy`
 * together):
 *
 * - Apply `[drgnBusy]` to the background content while the overlay is shown, and remove it when it is
 *   destroyed;
 * - Save `document.activeElement` before showing the overlay and restore it afterwards — if focus was
 *   inside the subtree made `inert`, the browser drops it on `<body>`; when the trigger is gone,
 *   move focus to the loaded content heading (`tabindex="-1"`) instead;
 * - The spinner itself never takes focus and its removal is not announced: announce completion or
 *   failure separately with the `Announcer` (`drgnAnnouncer`).
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
