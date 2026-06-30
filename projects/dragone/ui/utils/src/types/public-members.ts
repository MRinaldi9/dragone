/**
 * Extract the public surface of a class **excluding** private (`#` / `private` / `protected`)
 * members.
 *
 * TypeScript’s `keyof T` already excludes non‑public keys, so this mapped type serves as
 * documentation (“I only want the public API”) and produces a plain object type that is
 * structurally compatible across different class implementations sharing the same public
 * interface.
 *
 * @example
 *   ```ts
 *   class Counter {
 *   readonly count = signal(0);
 *   #internal = 'secret';
 *
 *   increment(): void { this.count.update(n => n + 1); }
 *   private log(): void { /* … * / }
 *   }
 *
 *   type CounterApi = PublicMembers<Counter>;
 *   //   ^? { readonly count: Signal<number>; increment(): void }
 *   ```;
 */
export type PublicMembers<T> = {
  [K in keyof T]: T[K];
};

/**
 * Like {@link PublicMembers}, but keeps only **value** properties (everything that is **not** a
 * callable).
 *
 * Useful when you want to serialise or transfer the data portion of a class instance without its
 * methods.
 *
 * @example
 *   ```ts
 *   class Todo {
 *     title = signal('buy milk');
 *     done = signal(false);
 *
 *     toggle(): void {
 *       this.done.update(v => !v);
 *     }
 *   }
 *
 *   type TodoData = PublicValues<Todo>;
 *   //   ^? { title: Signal<string>; done: Signal<boolean> }
 *   ```;
 */
export type PublicValues<T> = {
  [K in keyof T as T[K] extends (...args: unknown[]) => unknown ? never : K]: T[K];
};

/**
 * Like {@link PublicMembers}, but keeps only **method** properties (everything that **is** a
 * callable).
 *
 * Useful when you need to type a dynamic invocation interface, e.g. a registry of action handlers.
 *
 * @example
 *   ```ts
 *   type TodoActions = PublicMethods<Todo>;
 *   //   ^? { toggle(): void }
 *   ```;
 */
export type PublicMethods<T> = {
  [K in keyof T as T[K] extends (...args: unknown[]) => unknown ? K : never]: T[K];
};
