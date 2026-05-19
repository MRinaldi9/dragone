import {
  InjectionToken,
  type Signal,
  type Provider,
  type Type,
  assertInInjectionContext,
  inject,
} from '@angular/core';

export interface RadioGroupContext {
  readonly readonly: Signal<boolean>;
}

const RADIO_GROUP_CONTEXT = new InjectionToken<RadioGroupContext>('Radio Group Context');

export const provideRadioGroupContext = <T>(component: Type<T>): Provider => ({
  provide: RADIO_GROUP_CONTEXT,
  useExisting: component,
});

export const injectRadioGroupContext = (): RadioGroupContext => {
  assertInInjectionContext(injectRadioGroupContext);
  return inject(RADIO_GROUP_CONTEXT);
};
