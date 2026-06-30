export const getLocaleWeekDays = (
  weekday: Intl.DateTimeFormatOptions['weekday'],
  locale = 'it-IT',
): string[] => {
  const { format } = new Intl.DateTimeFormat(locale, { weekday });
  return Array.from({ length: 7 }, (_, i) => format(new Date(2020, 5, i + 1)));
};
