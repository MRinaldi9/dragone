import { isSignal, type ElementRef } from '@angular/core';

import type { MaybeSignal } from '../types/branding';

export const toElement = <T extends Element>(
  elementRef: MaybeSignal<ElementRef<T> | null | undefined>,
): T | undefined => {
  if (isSignal(elementRef)) {
    return elementRef()?.nativeElement;
  }
  return elementRef?.nativeElement;
};
