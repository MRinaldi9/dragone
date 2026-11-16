import { Component } from '@angular/core';

import { injectLayoutState } from '@dragone/ui/utils';

import { injectDrgnCardState } from '../card-state';

/**
 * Card body: the padded content column of a Card. Padding and gap follow the parent Card `type` and
 * `layout` — no inputs needed.
 */
@Component({
  selector: 'drgn-card-body',
  template: ` <ng-content /> `,
  styleUrl: './card-body.css',
  host: {
    '[attr.data-type]': 'drgnCardState().type()',
    '[attr.data-layout]': 'layoutState().layout()'
  }
})
export class CardBody {
  protected readonly drgnCardState = injectDrgnCardState();
  protected readonly layoutState = injectLayoutState();
}
