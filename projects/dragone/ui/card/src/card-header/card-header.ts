import { Component } from '@angular/core';

import { injectLayoutState } from '@dragone/ui/utils';

import { injectDrgnCardState } from '../card-state';

/**
 * Card header: the top row of a Card body.
 *
 * - `portrait`/`landscape`: a category tag (`CardTag`) plus the date, space-between.
 * - `process`: a leading icon plus the date.
 *
 * Compose with `slot="leading"` (tag or icon) and `slot="trailing"` (date) content. The trailing
 * slot is styled as the Sirio card date (monospace); project a short date, preferably a `<time
 * datetime="...">` element so the date stays machine-readable.
 */
@Component({
  selector: 'drgn-card-header',
  template: `
    <ng-content select="[slot='leading']" />
    <ng-content select="[slot='trailing']" />
  `,
  styleUrl: './card-header.css',
  host: {
    '[attr.data-type]': 'drgnCardState().type()',
    '[attr.data-layout]': 'layoutState().layout()'
  }
})
export class CardHeader {
  protected readonly drgnCardState = injectDrgnCardState();
  protected readonly layoutState = injectLayoutState();
}
