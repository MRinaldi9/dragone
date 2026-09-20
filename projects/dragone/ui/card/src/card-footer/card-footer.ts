import { Component, input } from '@angular/core';

import type { CardType } from '../card';

@Component({
  selector: 'drgn-card-footer',
  template: ` <ng-content /> `,
  styleUrl: './card-footer.css',
  host: {
    '[attr.data-type]': 'type()',
  },
})
export class CardFooter {
  /**
   * The card type, used to switch between actions-only and button+action layouts. @default
   * 'portrait'
   */
  readonly type = input<CardType>('portrait');
}
