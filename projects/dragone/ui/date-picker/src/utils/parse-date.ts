import type { NgpDateAdapter } from 'ng-primitives/date-time';

import { normalizeToDate } from './normalize-to-date';

// ---------------------------------------------------------------------------
// Date‑entry formats and regex helpers
// ---------------------------------------------------------------------------

// Reference date used to extract locale-specific separators from DateTimeFormat.
const REFERENCE_DATE = new Date(2000, 0, 15);

// Supported date-entry formats, tried from most-specific to least-specific.
const DATE_ENTRY_FORMATS = [
  { parts: ['day', 'month', 'year'], defaults: {} },
  { parts: ['month', 'year'], defaults: { day: 1 } },
  { parts: ['year'], defaults: { day: 1, month: 1 } }
] as const;

const _escapeRegex = (str: string): string => str.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

const _deriveDateSeparator = (fmt: Intl.DateTimeFormat): string => {
  const parts = fmt.formatToParts(REFERENCE_DATE);
  return _escapeRegex(parts.find(({ type }) => type === 'literal')?.value ?? '/');
};

const _buildDateParsePatterns = (fmt: Intl.DateTimeFormat): RegExp[] => {
  const separator = _deriveDateSeparator(fmt);
  const dayPattern = String.raw`(\d{1,2})`;
  const monthPattern = String.raw`(\d{1,2})`;
  const yearPattern = String.raw`(\d{1,4})`;
  return [
    new RegExp(`^${dayPattern}${separator}${monthPattern}${separator}${yearPattern}$`),
    new RegExp(`^${monthPattern}${separator}${yearPattern}$`),
    new RegExp(`^${yearPattern}$`)
  ];
};

const _tryParseDateEntry = <T>(
  input: string,
  regex: RegExp,
  adapter: NgpDateAdapter<T>,
  { defaults, parts }: (typeof DATE_ENTRY_FORMATS)[number]
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
 * Parses a locale-formatted date string (`dd/mm/yyyy`, `mm/yyyy`, or `yyyy`) into `T`, returning
 * `undefined` when unparseable or when a full date does not round-trip through `formatter`.
 */
export const parseLocaleDateString = <T>(
  value: string,
  adapter: NgpDateAdapter<T>,
  formatter: Intl.DateTimeFormat
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
