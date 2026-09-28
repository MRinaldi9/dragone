import { Component, input } from '@angular/core';

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
  template: `
    <div class="spinner-rotor" aria-hidden="true" data-testid="spinner-rotor">
      <div class="spinner-ring" data-testid="spinner-ring"></div>
      <div class="spinner-head" data-testid="spinner-head"></div>
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
  /** The size of the spinner. Medium matches the 64px Penpot component. */
  readonly size = input<SpinnerSize>('medium');
  /**
   * Accessible name announced when loading starts. role="status" only takes its name from the
   * author (aria-label), never from contents — hence the binding instead of a text node. Empty or
   * blank values fall back to the default via {@link coerceSpinnerLabel}.
   *
   * @default 'Caricamento in corso'
   */
  readonly label = input(SPINNER_DEFAULT_LABEL, {
    transform: coerceSpinnerLabel
  });
}
