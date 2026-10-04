import { Component } from '@angular/core';

/**
 * Card link: the stretched link that makes a whole Card clickable.
 *
 * Applied as an attribute selector on a native `a` — the anchor keeps its native behavior (`href`,
 * `target`, `aria-label`/`aria-labelledby`, `routerLink`, ...) with no Dragone emulation in
 * between:
 *
 * ```html
 * <a drgn-card-link href="/detail" aria-label="Apri il dettaglio della card"></a>
 * ```
 *
 * Fixed safe default: the host metadata sets `rel="noopener noreferrer"`. A `rel` written by the
 * consumer — statically (`rel="author"`) or bound (`[attr.rel]="..."`) — takes precedence over the
 * host default, so diverging stays fully native. Same-tab links are unaffected by the default;
 * `target="_blank"` links get reverse-tabnabbing protection for free.
 *
 * Keep it empty (stretched-link usage) and give it an accessible name via `aria-label` or
 * `aria-labelledby` (e.g. pointing at the card title id). When combined with a title link, point
 * both links at the same `href`.
 */
@Component({
  selector: 'a[drgnCardLink],a[drgn-card-link]',
  template: ` <ng-content /> `,
  styleUrl: './card-link.css',
  host: {
    rel: 'noopener noreferrer'
  }
})
export class CardLink {}
