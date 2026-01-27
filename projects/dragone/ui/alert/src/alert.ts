import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Button } from '@dragone/ui/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCircleCheck,
  faSolidCircleExclamation,
  faSolidCircleInfo,
  faSolidTriangleExclamation,
} from '@ng-icons/font-awesome/solid';

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
    <ng-icon size="24" class="alert-icon" [svg]="alertType()" />
    <h4 class="drgn-h4-lg alert-title">{{ title() }}</h4>

    <div class="drgn-p-lg-01 alert-body">
      <ng-content />
    </div>
    @if (ctaText()) {
      <button drgnButton variant="tertiary" class="alert-action" (click)="ctaClick.emit()">
        {{ ctaText() }}
      </button>
    }
  `,
  styleUrl: './alert.css',
  providers: [
    provideIcons({
      faSolidCircleInfo,
      faSolidCircleCheck,
      faSolidCircleExclamation,
      faSolidTriangleExclamation,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'alert',
    '[ariaLive]': 'politeness()',
    '[ariaAtomic]': 'true',
    '[attr.data-variant]': 'aspect()',
    '[attr.data-theme]': 'alertTheme()',
    '[class.drgn-dark]': "alertTheme() === 'dark'",
  },
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
  /** Defines the theme of the alert.
   * @default 'light'
   */
  readonly alertTheme = input<'dark' | 'light'>('light');
  /**
   * Optional call to action text for the alert.
   */
  readonly ctaText = input<string>();
  readonly ctaClick = output<void>();
}
