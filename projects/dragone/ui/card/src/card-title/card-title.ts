import { Component, computed, effect, inject, input } from '@angular/core';

import { injectElementRef, Logger, provideLogger, toNativeElement } from '@dragone/ui/utils';

export type AriaLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Card title. Applied as an attribute selector on a native `p` (plain title, e.g. process cards) or
 * `a` (title link, e.g. landscape/portrait cards).
 *
 * ```html
 * <p drgn-card-title>Titolo</p>
 * <h3><a drgn-card-title href="/target">Titolo</a></h3>
 * ```
 *
 * A link keeps its link semantics: `asHeading` only applies to plain (`p`) titles. To expose a
 * title link as a heading, wrap it in a native heading element.
 */
@Component({
  selector: 'p[drgn-card-title],a[drgn-card-title]',
  template: ` <ng-content /> `,
  styleUrl: './card-title.css',
  ...(ngDevMode ? { providers: [provideLogger(CardTitle.name)] } : {}),
  host: {
    '[attr.role]': 'headingRole()',
    '[attr.aria-level]': 'headingAriaLevel()'
  }
})
export class CardTitle {
  /**
   * Whether a plain title should be exposed as a heading. Ignored on link titles, which keep their
   * link role. @default false
   */
  readonly asHeading = input(false);
  /** The heading level used when asHeading applies. @default 3 */
  readonly headingLevel = input<AriaLevel>(3);

  private readonly isLinkHost =
    toNativeElement(injectElementRef<HTMLAnchorElement>())?.tagName === 'A';
  protected readonly headingRole = computed(() =>
    this.asHeading() && !this.isLinkHost ? 'heading' : null
  );
  protected readonly headingAriaLevel = computed<AriaLevel | null>(() =>
    this.asHeading() && !this.isLinkHost ? this.headingLevel() : null
  );

  constructor() {
    if (ngDevMode) {
      const logger = inject(Logger);
      effect(() => {
        if (this.asHeading() && this.isLinkHost) {
          logger.warn(
            '`asHeading` is ignored on link titles (`a[drgn-card-title]`): ' +
              'a link keeps its link semantics. Wrap the link in a native heading element instead.'
          );
        }
      });
    }
  }
}
