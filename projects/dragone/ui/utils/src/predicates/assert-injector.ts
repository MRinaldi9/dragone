import { assertInInjectionContext, inject, Injector, runInInjectionContext } from '@angular/core';

import type { Nil } from '../types/utils';

type Runner<T> = () => T;

export function assertInjector<T>(
  fn: (...args: never[]) => unknown,
  injector: Injector | Nil,
  runner: Runner<T>
): T;
export function assertInjector(
  fn: (...args: never[]) => unknown,
  injector: Injector | Nil
): Injector;
export function assertInjector<T>(
  fn: (...args: never[]) => unknown,
  injector: Injector | Nil,
  runner?: Runner<T>
): T | Injector {
  if (!injector) assertInInjectionContext(fn);
  const assertedInjector = injector ?? inject(Injector);
  if (!runner) return assertedInjector;
  return runInInjectionContext(assertedInjector, runner);
}
