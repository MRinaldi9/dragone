import { Component } from '@angular/core';

import { injectLayoutState } from '@dragone/ui/utils';

import { injectDrgnCardState } from '../card-state';

/**
 * Card footer: the actions row at the bottom of a Card body.
 *
 * - `portrait`/`landscape`: icon-only actions (e.g. share, bookmark), end-aligned.
 * - `process`: a text button plus a single overflow action, start-aligned.
 *
 * The footer sits above a `CardLink` stretched link (if any), so footer actions stay clickable.
 * Icon-only actions that open a menu are menu triggers owned by the consumer (see the `Dropdown`
 * Sirio pattern): give them an accessible name plus `aria-haspopup="menu"` and `aria-expanded`
 * (`aria-expanded="false"` until the menu opens) once a menu Component is composed in.
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
