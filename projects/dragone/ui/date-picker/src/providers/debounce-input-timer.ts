import { assertInInjectionContext, inject, InjectionToken } from '@angular/core';

export const INPUT_DEBOUNCE_TIMER = new InjectionToken<number>('InputDebounceTimer');

export const injectInputDebounceTimer = (): number => {
  assertInInjectionContext(injectInputDebounceTimer);
  return inject(INPUT_DEBOUNCE_TIMER, { optional: true }) ?? 600;
};
