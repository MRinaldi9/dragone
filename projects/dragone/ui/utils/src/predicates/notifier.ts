/**
 * Implementation of a notifier that can be used to notify effects or other consumers. Is based on
 * the implementation of Ngxtension
 * (https://github.com/ngxtension/ngxtension-platform/blob/main/libs/ngxtension/create-notifier/src/create-notifier.ts)
 */
import { linkedSignal, signal, type Signal } from '@angular/core';

interface CreateNotifierOptions {
  deps?: Signal<unknown>[];
  depsEmitInitially?: boolean;
}

const DEFAULT_OPTIONS: Required<CreateNotifierOptions> = {
  deps: [],
  depsEmitInitially: true,
};

/**
 * Creates a signal notifier that can be used to notify effects or other consumers.
 *
 * @returns A notifier object.
 */
export const createNotifier = (
  options?: CreateNotifierOptions,
): {
  notify: () => void;
  listen: Signal<number>;
} => {
  const mergedOptions: Required<CreateNotifierOptions> = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  // Without explicit deps we can simplify to a simple signal
  const sourceSignal = !mergedOptions.deps.length
    ? signal(0)
    : linkedSignal<number, number>({
        source: () => {
          const { deps, depsEmitInitially } = mergedOptions;
          for (const dep of deps) {
            dep(); // Track all dependencies
          }

          // When deps exist, the notifier should start at 1, because it immediately emits.
          // without any deps, it is only based on increments. and those should start at 0.
          return deps.length && depsEmitInitially ? 1 : 0;
        },
        // Return a new value each time source runs. This ensures deps changes also increment the counter
        computation: (currentIncrementer, previousValue) =>
          // Increment from previous value when deps change
          previousValue !== undefined ? previousValue.value + 1 : currentIncrementer,
        equal: () => false, // Always notify downstream consumers
      });

  return {
    notify: () => sourceSignal.update(bit => bit + 1),
    listen: sourceSignal.asReadonly(),
  };
};
