import { isSignal, untracked, type ElementRef } from '@angular/core';

import type { MaybeSignal } from '../types/utils';

export interface toNativeElementFn {
  <T extends Element>(elementRef: MaybeSignal<ElementRef<T> | null | undefined>): T | undefined;
  untracked: <T extends Element>(
    elementRef: MaybeSignal<ElementRef<T> | null | undefined>
  ) => T | undefined;
}

const toNativeElementFn = <T extends Element>(
  elementRef: MaybeSignal<ElementRef<T> | null | undefined>,
  untr = false
): T | undefined => {
  if (isSignal(elementRef)) {
    return untr ? untracked(() => elementRef()?.nativeElement) : elementRef()?.nativeElement;
  }
  return elementRef?.nativeElement;
};

export const toNativeElement = ((): toNativeElementFn => {
  const fn = toNativeElementFn as toNativeElementFn;
  fn.untracked = <T extends Element>(
    elementRef: MaybeSignal<ElementRef<T> | null | undefined>
  ): T | undefined => toNativeElementFn(elementRef, true);
  return fn;
})();
