import type { Branded } from '@dragone/ui/utils';

export type IETFLanguageTag = Branded<string, 'IETFLanguageTag'>;

const IETF_REGEX = /^[a-z]{2,3}(?:-[A-Z][a-z]{3})?(?:-[A-Z]{2}|-[0-9]{3})?$/i;

const isLocaleSupported = (locale: string): boolean => {
  try {
    const supported = Intl.DateTimeFormat.supportedLocalesOf(locale, { localeMatcher: 'lookup' });
    return supported.length > 0;
  } catch {
    return false;
  }
};

export function isETFLanguageTag(value: unknown): asserts value is IETFLanguageTag {
  if (typeof value !== 'string' || !IETF_REGEX.test(value) || !isLocaleSupported(value)) {
    throw new Error('Invalid IETF language tag');
  }
}
