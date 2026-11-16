import { Component, input } from '@angular/core';

import { TestId } from '@dragone/ui/utils';

export type SpinnerSize = 'small' | 'medium' | 'large';

/** Fallback accessible name used when an empty or blank label is bound. */
export const SPINNER_DEFAULT_LABEL = 'Caricamento in corso';

/**
 * Falls back to {@link SPINNER_DEFAULT_LABEL} when an empty or blank label is bound, so the status
 * always keeps an accessible name (WCAG 4.1.2 Name, Role, Value).
 */
export function coerceSpinnerLabel(value: string | undefined): string {
  return value?.trim() ? value : SPINNER_DEFAULT_LABEL;
}

@Component({
  selector: 'drgn-spinner',
  imports: [TestId],
  template: `
    <div class="spinner-rotor" aria-hidden="true" drgnTestId="spinner-rotor">
      <div class="spinner-ring" drgnTestId="spinner-ring"></div>
      <div class="spinner-head" drgnTestId="spinner-head"></div>
    </div>
  `,
  styleUrl: './spinner.css',
  host: {
    role: 'status',
    '[attr.aria-label]': 'label()',
    '[attr.data-size]': 'size()'
  }
})
export class Spinner {
  /** The size of the spinner. */
  readonly size = input<SpinnerSize>('medium');
  /**
   * Accessible name announced when loading starts; blank values fall back to
   * {@link SPINNER_DEFAULT_LABEL}.
   *
   * @default 'Caricamento in corso'
   */
  // role="status" takes its accessible name from the author (aria-label), never from contents.
  readonly label = input(SPINNER_DEFAULT_LABEL, {
    transform: coerceSpinnerLabel
  });
}
