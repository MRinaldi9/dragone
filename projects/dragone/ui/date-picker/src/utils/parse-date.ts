import type { NgpDateAdapter } from 'ng-primitives/date-time';

import { normalizeToDate } from './normalize-to-date';

// ---------------------------------------------------------------------------
// Date‑entry formats and regex helpers
// ---------------------------------------------------------------------------

/** Reference date used to extract locale‑specific separators from DateTimeFormat. */
const REFERENCE_DATE = new Date(2000, 0, 15);

/**
 * Supported date‑entry formats, tried in order from most‑specific to least‑specific. Each entry
 * lists the captured groups and the default values for missing fields.
 */
const DATE_ENTRY_FORMATS = [
  { parts: ['day', 'month', 'year'], defaults: {} },
  { parts: ['month', 'year'], defaults: { day: 1 } },
  { parts: ['year'], defaults: { day: 1, month: 1 } },
] as const;

/** Escape special regex characters in a string. */
const _escapeRegex = (str: string): string => str.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

/** Derive the date‑separator (e.g. `/`, `.`, `-`) from a locale’s DateTimeFormat. */
const _deriveDateSeparator = (fmt: Intl.DateTimeFormat): string => {
  const parts = fmt.formatToParts(REFERENCE_DATE);
  return _escapeRegex(parts.find(({ type }) => type === 'literal')?.value ?? '/');
};

/**
 * Build an ordered list of regex patterns for the three supported date‑entry formats: 1. day /
 * month / year 2. month / year 3. year only
 *
 * Patterns are built fresh each call — the cost is negligible (3 small regex).
 */
const _buildDateParsePatterns = (fmt: Intl.DateTimeFormat): RegExp[] => {
  const separator = _deriveDateSeparator(fmt);
  const dayPattern = String.raw`(\d{1,2})`;
  const monthPattern = String.raw`(\d{1,2})`;
  const yearPattern = String.raw`(\d{1,4})`;
  return [
    new RegExp(`^${dayPattern}${separator}${monthPattern}${separator}${yearPattern}$`),
    new RegExp(`^${monthPattern}${separator}${yearPattern}$`),
    new RegExp(`^${yearPattern}$`),
  ];
};

// ---------------------------------------------------------------------------
// Entry matching
// ---------------------------------------------------------------------------

/**
 * Try to match `input` against `regex` and, if successful, build a date object from the captured
 * groups using the field mapping in `formatEntry`.
 */
const _tryParseDateEntry = <T>(
  input: string,
  regex: RegExp,
  adapter: NgpDateAdapter<T>,
  { defaults, parts }: (typeof DATE_ENTRY_FORMATS)[number],
): T | null => {
  const match = input.match(regex);
  if (!match) return null;

  const dateFields: Record<string, number> = { ...defaults };
  for (let groupIndex = 0; groupIndex < parts.length; groupIndex += 1) {
    dateFields[parts[groupIndex]] = Number(match[groupIndex + 1]);
  }

  const { day = 1, month = 1, year } = dateFields;
  if (year > 9999 || year < 1000 || month > 12 || month < 1 || day > 31 || day < 1) {
    return null;
  }

  try {
    return adapter.create({ year, month, day });
  } catch {
    return null;
  }
};

/**
 * Parse a locale‑formatted date string into a typed date object.
 *
 * Tries the three supported formats in order (day/month/year, month/year, year) and returns the
 * first successful match. For the full format, the result is round‑tripped through the formatter to
 * reject ambiguous inputs (e.g. `02/03/04` that might not match the locale’s canonical
 * representation).
 *
 * This is a **pure function** — it has no DI dependencies and can be used standalone.
 *
 * @param value The raw string to parse.
 * @param adapter An `NgpDateAdapter<T>` (e.g. from `injectDateAdapter()`).
 * @param formatter An `Intl.DateTimeFormat` matching the expected locale/options.
 * @returns The parsed date, or `undefined` if the string is not parseable.
 */
export const parseLocaleDateString = <T>(
  value: string,
  adapter: NgpDateAdapter<T>,
  formatter: Intl.DateTimeFormat,
): T | undefined => {
  const input = value.trim();
  if (!input) return undefined;

  const patterns = _buildDateParsePatterns(formatter);

  for (let i = 0; i < 3; i += 1) {
    const result = _tryParseDateEntry(input, patterns[i], adapter, DATE_ENTRY_FORMATS[i]);

    if (result !== null) {
      // For the full day/month/year format, reject inputs that don't round‑trip
      // (e.g. because the locale expects a two‑digit day but the user typed three).
      return i === 0 && formatter.format(normalizeToDate(result, adapter)) !== input
        ? undefined
        : result;
    }
  }

  return undefined;
};
