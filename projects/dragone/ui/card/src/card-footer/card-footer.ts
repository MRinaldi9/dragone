import { Component } from '@angular/core';

import { injectLayoutState } from '@dragone/ui/utils';

import { injectDrgnCardState } from '../card-state';

/**
 * Actions row at the bottom of a `CardBody`: end-aligned icon actions in `portrait`/`landscape`
 * cards, or a start-aligned text button plus overflow action in `process` cards.
 */
@Component({
  selector: 'drgn-card-footer',
  template: ` <ng-content /> `,
  styleUrl: './card-footer.css',
  host: {
    '[attr.data-type]': 'drgnCardState().type()',
    '[attr.data-layout]': 'layoutState().layout()'
  }
})
export class CardFooter {
  protected readonly drgnCardState = injectDrgnCardState();
  protected readonly layoutState = injectLayoutState();
}
