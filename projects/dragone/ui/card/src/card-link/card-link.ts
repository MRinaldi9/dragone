import { Component } from '@angular/core';

/**
 * Stretched link that makes an entire `Card` clickable while keeping native `<a>` behavior (and a
 * default `rel="noopener noreferrer"`). Name it with `aria-label` or `aria-labelledby`:
 *
 * ```html
 * <a drgn-card-link href="/detail" aria-label="Apri il dettaglio della card"></a>
 * ```
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
