import type { Signal } from '@angular/core';
import { createPrimitive } from 'ng-primitives/state';

/**
 * The layout type of a Card, mirroring the Sirio "tipologia" variants.
 *
 * - `landscape`: image on the left, content on the right.
 * - `portrait`: image on top, content below.
 * - `process`: no image; header shows an icon instead of a category tag.
 */
export type CardType = 'landscape' | 'portrait' | 'process';

export interface CardState {
  type: Signal<CardType>;
}

export const [, drgnCardFactory, injectDrgnCardState, provideDrgnCardState] = createPrimitive(
  'DragoneCardState',
  ({ type }: { type: Signal<CardType> }): CardState => ({
    type,
  }),
);
