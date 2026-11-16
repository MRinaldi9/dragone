import { Directive, input } from '@angular/core';

/** Sets `data-testid` on the host element in development mode only (`ngDevMode`). */
@Directive({
  selector: '[drgnTestId]',
  host: {
    '[attr.data-testid]': 'resolvedTestId()'
  }
})
export class TestId {
  /** Test identifier rendered as `data-testid` when `ngDevMode` is enabled. */
  readonly testId = input.required<string>({ alias: 'drgnTestId' });

  protected readonly resolvedTestId = ngDevMode ? this.testId : (): null => null;
}
