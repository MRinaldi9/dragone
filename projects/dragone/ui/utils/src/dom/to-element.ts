import { isSignal, untracked, type ElementRef } from '@angular/core';

import type { MaybeSignal } from '../types/branding';

export interface toElementFn {
  <T extends Element>(elementRef: MaybeSignal<ElementRef<T> | null | undefined>): T | undefined;
  untracked: <T extends Element>(
    elementRef: MaybeSignal<ElementRef<T> | null | undefined>,
  ) => T | undefined;
}

const toElementFn = <T extends Element>(
  elementRef: MaybeSignal<ElementRef<T> | null | undefined>,
  untr = false,
): T | undefined => {
  if (isSignal(elementRef)) {
    return untr ? untracked(() => elementRef()?.nativeElement) : elementRef()?.nativeElement;
  }
  return elementRef?.nativeElement;
};

export const toElement = ((): toElementFn => {
  const fn = toElementFn as toElementFn;
  fn.untracked = <T extends Element>(
    elementRef: MaybeSignal<ElementRef<T> | null | undefined>,
  ): T | undefined => toElementFn(elementRef, true);
  return fn;
})();
