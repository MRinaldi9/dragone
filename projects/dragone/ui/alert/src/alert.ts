import { Component, computed, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import {
  faSolidCircleCheck,
  faSolidCircleExclamation,
  faSolidCircleInfo,
  faSolidTriangleExclamation,
} from '@ng-icons/font-awesome/solid';

import { Button } from '@dragone/ui/button';
import { Theme } from '@dragone/ui/utils';

export type AlertPolite = 'off' | 'polite' | 'assertive';

const TYPE_TO_ICON = {
  info: faSolidCircleInfo,
  success: faSolidCircleCheck,
  warning: faSolidTriangleExclamation,
  error: faSolidCircleExclamation,
} as const;

@Component({
  selector: 'drgn-alert',
  imports: [NgIcon, Button],
  template: `
    <ng-icon size="24" class="alert-icon" data-testid="alert-icon" [svg]="alertType()" />
    <p
      class="drgn-h4-lg alert-title"
      [attr.role]="titleAsHeading() ? 'heading' : null"
      [attr.aria-level]="titleAsHeading() ? headingLevel() : null"
    >
      {{ title() }}
    </p>

    <div class="drgn-p-lg-01 alert-body">
      <ng-content />
    </div>
    @if (ctaText()) {
      <button drgnButton variant="tertiary" class="alert-action" (click)="ctaClick.emit($event)">
        {{ ctaText() }}
      </button>
    }
  `,
  styleUrl: './alert.css',
  host: {
    '[attr.role]': 'ariaRole()',
    '[ariaLive]': 'politeness()',
    '[ariaAtomic]': 'ariaAtomic()',
    '[attr.data-variant]': 'aspect()',
  },
  hostDirectives: [{ directive: Theme, inputs: ['theme'] }],
})
export class Alert {
  readonly title = input.required<string>();
  readonly alertType = input<string, 'info' | 'success' | 'warning' | 'error'>(TYPE_TO_ICON.info, {
    transform: type => TYPE_TO_ICON[type],
  });
  /** Defines the politeness level for screen readers.
   * @default 'assertive'
   */
  readonly politeness = input<AlertPolite>('assertive');
  /** Defines the variant of the alert.
   * @default 'desktop'
   */
  readonly aspect = input<'mobile' | 'desktop'>('desktop');
  /** Defines whether the title should be exposed as a heading.
   * @default false
   */
  readonly titleAsHeading = input(false);
  /** Defines the heading level used when titleAsHeading is true.
   * @default 4
   */
  readonly headingLevel = input<1 | 2 | 3 | 4 | 5 | 6>(4);
  /**
   * Optional call to action text for the alert.
   */
  readonly ctaText = input<string>();
  readonly ctaClick = output<PointerEvent>();

  protected readonly ariaRole = computed<'alert' | 'status' | null>(
    (politeness = this.politeness()) => {
      if (politeness === 'off') {
        return null;
      }

      return politeness === 'assertive' ? 'alert' : 'status';
    },
  );

  protected readonly ariaAtomic = computed<'true' | null>(() =>
    this.politeness() === 'off' ? null : 'true',
  );
}
