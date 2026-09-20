import { Component, input } from '@angular/core';

export type AriaLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Card title. Applied as an attribute selector on a native `p` (plain title) or `a` (title link,
 * e.g. landscape/portrait cards).
 *
 * ```html
 * <p drgn-card-title>Titolo</p>
 * <a drgn-card-title href="/target">Titolo</a>
 * ```
 */
@Component({
  selector: 'p[drgn-card-title],a[drgn-card-title]',
  template: ` <ng-content /> `,
  styleUrl: './card-title.css',
  host: {
    '[attr.role]': 'asHeading() ? "heading" : null',
    '[attr.aria-level]': 'asHeading() ? headingLevel() : null',
  },
})
export class CardTitle {
  /** Whether the title should be exposed as a heading. @default false */
  readonly asHeading = input(false);
  /** The heading level used when asHeading is true. @default 3 */
  readonly headingLevel = input<AriaLevel>(3);
}
