import { Component } from '@angular/core';

import { injectDrgnCardState } from '../card-state';

@Component({
  selector: 'drgn-card-header',
  template: `
    <ng-content select="[slot='leading']" />
    <ng-content select="[slot='trailing']" />
  `,
  styleUrl: './card-header.css',
  host: {
    '[attr.data-type]': 'drgnCardState().type()',
  },
})
export class CardHeader {
  protected readonly drgnCardState = injectDrgnCardState();
}
