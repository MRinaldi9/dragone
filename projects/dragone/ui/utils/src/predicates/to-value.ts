import { isSignal, untracked as untr } from '@angular/core';

import type { MaybeSignal } from '../types/branding';

export interface ToValueFn {
  <T>(val: MaybeSignal<T>): T;
  untracked: <T>(val: MaybeSignal<T>) => T;
}

const toValueFn = <T>(maybeSignal: MaybeSignal<T>, untracked = false): T => {
  if (isSignal(maybeSignal)) {
    return untracked ? untr(maybeSignal) : maybeSignal();
  }
  return maybeSignal;
};

export const toValue = (() => {
  const fn = toValueFn as ToValueFn;
  fn.untracked = val => toValueFn(val, true);
  return fn;
})();
