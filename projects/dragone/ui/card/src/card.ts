import { Component, input } from '@angular/core';

import { Theme } from '@dragone/ui/utils';

import { drgnCardFactory, provideDrgnCardState, type CardType } from './card-state';

/**
 * Card is a pure surface container: it provides the visual shell (background, radius, shadow,
 * theme) and the layout type, while the content is composed by the consumer via the Card Children
 * Components (`CardHeader`, `CardBody`, `CardFooter`, `CardImage`, ...).
 */
@Component({
  selector: 'drgn-card',
  template: ` <ng-content /> `,
  styleUrl: './card.css',
  providers: [provideDrgnCardState()],
  host: {
    '[attr.data-type]': 'type()',
  },
  hostDirectives: [{ directive: Theme, inputs: ['theme'] }],
})
export class Card {
  /** The layout type of the card. @default 'portrait' */
  readonly type = input<CardType>('portrait');
  constructor() {
    drgnCardFactory({ type: this.type });
  }
}
