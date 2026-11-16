import { Component } from '@angular/core';

import { injectLayoutState } from '@dragone/ui/utils';

import { injectDrgnCardState } from '../card-state';

/**
 * Top row of a `CardBody`. Project a `CardTag` or icon into `slot="leading"` and a date (preferably
 * `<time datetime="...">`) into `slot="trailing"`.
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
