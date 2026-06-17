import { assertInInjectionContext, inject, InjectionToken } from '@angular/core';

export const FORMAT_DATE = new InjectionToken<{
  locale: string;
  options?: Intl.DateTimeFormatOptions;
}>('Formatter Datepicker');

export const injectFormatDate = (): Intl.DateTimeFormat => {
  assertInInjectionContext(injectFormatDate);
  const config = inject(FORMAT_DATE, { optional: true }) ?? {
    locale: 'it-IT',
    options: {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    },
  };
  const formatter = new Intl.DateTimeFormat(config.locale, config.options);
  return formatter;
};
