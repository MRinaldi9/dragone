import type { Signal } from '@angular/core';

export type Branded<T, B> = T & { __brand: B };
export type MaybeSignal<T> = T | Signal<T>;
export type Primitive = string | number | boolean | null | undefined | symbol | bigint;
export type LiteralUnion<LiteralType, BaseType extends Primitive> =
  | LiteralType
  | (BaseType & Record<never, never>);
export type Nil = Extract<Primitive, null | undefined>;
export type SvgIcon = Branded<string, 'SvgIcon'>;
