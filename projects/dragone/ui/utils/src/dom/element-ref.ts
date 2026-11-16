import { ElementRef, inject, type Injector } from '@angular/core';

import { assertInjector } from '../predicates/assert-injector';

export function injectElementRef<T extends HTMLElement>(injector?: Injector): ElementRef<T> {
  return assertInjector(injectElementRef, injector, () => inject<ElementRef<T>>(ElementRef));
}
