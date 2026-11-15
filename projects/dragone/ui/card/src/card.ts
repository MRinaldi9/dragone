import { Component, input } from '@angular/core';

import { Layout, Theme } from '@dragone/ui/utils';

import { drgnCardFactory, provideDrgnCardState, type CardType } from './card-state';

export type { CardType } from './card-state';

/**
 * Surface container providing the card shell (`type`, `theme`, `layout`). Compose with `CardBody`,
 * optional skeleton parts (`CardHeader`, `CardFooter`, `CardImage`, `CardLink`), and typography
 * helpers (`CardTitle`, `CardSubtitle`, `CardText`, `CardSignature`, `CardTag`) or native
 * elements.
 */
@Component({
  selector: 'drgn-card',
  template: ` <ng-content /> `,
  styleUrl: './card.css',
  providers: [provideDrgnCardState()],
  host: {
    '[attr.data-type]': 'type()'
  },
  hostDirectives: [
    { directive: Theme, inputs: ['theme'] },
    { directive: Layout, inputs: ['drgnLayout:layout'] }
  ]
})
export class Card {
  /** The layout type of the card. @default 'portrait' */
  readonly type = input<CardType>('portrait');
  constructor() {
    drgnCardFactory({ type: this.type });
  }
}
