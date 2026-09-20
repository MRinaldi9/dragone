import { NgOptimizedImage } from '@angular/common';
import { Component, input } from '@angular/core';

export type CardImagePosition = 'top' | 'left' | 'right';

@Component({
  selector: 'drgn-card-image',
  imports: [NgOptimizedImage],
  template: ` <img fill [ngSrc]="src()" [alt]="alt()" /> `,
  styleUrl: './card-image.css',
  host: {
    '[attr.data-position]': 'position()',
  },
})
export class CardImage {
  /** The image source URL. */
  readonly src = input.required<string>();
  /** The accessible alternative text for the image. */
  readonly alt = input.required<string>();
  /** The image position within the card. @default 'top' */
  readonly position = input<CardImagePosition>('top');
}
