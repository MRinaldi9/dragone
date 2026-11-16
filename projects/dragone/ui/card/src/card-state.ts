import type { Signal } from '@angular/core';
import { createPrimitive } from 'ng-primitives/state';

/**
 * Layout type of a `Card`: `landscape` (side image), `portrait` (top image), or `process` (icon
 * header, no image).
 */
export type CardType = 'landscape' | 'portrait' | 'process';

export interface CardState {
  type: Signal<CardType>;
}

export const [, drgnCardFactory, injectDrgnCardState, provideDrgnCardState] = createPrimitive(
  'DragoneCardState',
  ({ type }: { type: Signal<CardType> }): CardState => ({ type })
);
