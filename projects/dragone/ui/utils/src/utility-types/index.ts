import type { Signal } from '@angular/core';

export type Branded<T, B> = T & { __brand: B };
export type MaybeSignal<T> = T | Signal<T>;
