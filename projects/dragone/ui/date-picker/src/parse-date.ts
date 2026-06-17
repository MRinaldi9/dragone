import { assertInInjectionContext } from '@angular/core';
import { injectDateAdapter, type NgpDateAdapter } from 'ng-primitives/date-time';

import { injectFormatDate } from './format-date';

const SAMPLE = new Date(2000, 0, 15);
const SEGMENTS = [
  { parts: ['day', 'month', 'year'], dflt: {} },
  { parts: ['month', 'year'], dflt: { day: 1 } },
  { parts: ['year'], dflt: { day: 1, month: 1 } },
] as const;

const esc = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

const deriveSeparator = (fmt: Intl.DateTimeFormat): string => {
  const parts = fmt.formatToParts(SAMPLE);
  return esc(parts.find(({ type }) => type === 'literal')?.value ?? '/');
};

const buildPatterns = (fmt: Intl.DateTimeFormat): RegExp[] => {
  const sep = deriveSeparator(fmt);
  const dayPattern = String.raw`(\d{1,2})`,
    monthPattern = String.raw`(\d{1,2})`,
    yearPattern = String.raw`(\d{1,4})`;
  return [
    new RegExp(`^${dayPattern}${sep}${monthPattern}${sep}${yearPattern}$`),
    new RegExp(`^${monthPattern}${sep}${yearPattern}$`),
    new RegExp(`^${yearPattern}$`),
  ];
};

const tryMatch = <T>(
  input: string,
  regex: RegExp,
  adapter: NgpDateAdapter<T>,
  { dflt, parts }: (typeof SEGMENTS)[number],
): T | null => {
  const m = input.match(regex);
  if (!m) return null;
  const p = { ...dflt };
  for (let j = 0; j < parts.length; j++) p[parts[j]] = Number(m[j + 1]);
  const { day = 1, month: mo = 1, year } = p as Record<string, number>;
  if (year > 9999 || year < 1000 || mo > 12 || mo < 1 || day > 31 || day < 1) return null;
  try {
    return adapter.create({ year, month: mo, day });
  } catch {
    return null;
  }
};

export const parseLocaleDateString = <T extends Temporal.PlainDateTime | Date>(
  value: string,
  adapter: NgpDateAdapter<T>,
  formatter: Intl.DateTimeFormat,
): T | null => {
  const input = value.trim();
  if (!input) return null;
  const patterns: RegExp[] = ((formatter as unknown as Record<string, RegExp[]>)[
    '_drgnPatterns'
  ] ??= buildPatterns(formatter));
  for (let i = 0; i < 3; i += 1) {
    const r = tryMatch(input, patterns[i], adapter, SEGMENTS[i]);
    if (r !== null) return i === 0 && formatter.format(r) !== input ? null : r;
  }
  return null;
};

export const injectParseDate = <T extends Temporal.PlainDateTime | Date>(): ((
  value: string,
) => T | null) => {
  assertInInjectionContext(injectParseDate);
  const adapter = injectDateAdapter<T>();
  const formatter = injectFormatDate();
  return val => parseLocaleDateString(val, adapter, formatter);
};
