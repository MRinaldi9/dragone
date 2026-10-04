import { NgOptimizedImage } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { injectDrgnCardState } from '../card-state';

export type CardImagePosition = 'top' | 'left' | 'right';

/**
 * Card image. When `position` is omitted it follows the parent Card `type` (`landscape` renders the
 * image on the left, anything else on top), so consumers composing a `landscape` Card usually need
 * no `position` at all.
 */
@Component({
  selector: 'drgn-card-image',
  imports: [NgOptimizedImage],
  template: ` <img fill [ngSrc]="src()" [alt]="alt()" /> `,
  styleUrl: './card-image.css',
  host: {
    '[attr.data-position]': 'resolvedPosition()'
  }
})
export class CardImage {
  /** The image source URL. */
  readonly src = input.required<string>();
  /** The accessible alternative text for the image. */
  readonly alt = input.required<string>();
  /**
   * The image position within the card. When omitted it follows the parent Card type.
   *
   * @default parent Card type (`'left'` for `landscape`, `'top'` otherwise)
   */
  readonly position = input<CardImagePosition>();

  // No ng-primitives image primitive exists, so `NgOptimizedImage` is used directly.
  private readonly drgnCardState = injectDrgnCardState({ optional: true });
  protected readonly resolvedPosition = computed<CardImagePosition>(
    () => this.position() ?? (this.drgnCardState?.()?.type() === 'landscape' ? 'left' : 'top')
  );
}
