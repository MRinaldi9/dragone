import { isSignal, untracked as untr } from '@angular/core';

import type { MaybeSignal } from '../types/utils';

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

export const toValue = ((): ToValueFn => {
  const fn = toValueFn as ToValueFn;
  fn.untracked = <T>(val: MaybeSignal<T>): T => toValueFn(val, true);
  return fn;
})();
