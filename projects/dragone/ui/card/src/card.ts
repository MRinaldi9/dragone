import { Component, input } from '@angular/core';

import { Layout, Theme } from '@dragone/ui/utils';

import { drgnCardFactory, provideDrgnCardState, type CardType } from './card-state';

export type { CardType } from './card-state';

/**
 * Card is a pure surface container: it provides the visual shell (background, radius, shadow,
 * theme) and the layout type, while the content is composed by the consumer via `ng-content`.
 *
 * Two composition layers, both optional beyond `Card` + `CardBody`:
 *
 * - **Skeleton (layout):** `CardBody` (padded content column), `CardHeader` (top row with
 *   `slot="leading"` / `slot="trailing"`), `CardFooter` (actions row), `CardImage` (responsive
 *   illustration) and `CardLink` (stretched link). These carry the Sirio spacing and positioning;
 *   compose them when you need that behavior, skip them when you don't.
 * - **Typography helpers (convenience):** `CardTitle`, `CardSubtitle`, `CardText`, `CardSignature`
 *   and `CardTag` are token-safe shortcuts for the Sirio text styles. They are never required:
 *   plain native elements (`h3`, `p`, `span`, `time`) projected into the skeleton are a first-class
 *   alternative when the consumer wants full control of the UI.
 *
 * Children Components read `type` from the Card state and `layout` from the shared `Layout` state —
 * never pass them down manually.
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
