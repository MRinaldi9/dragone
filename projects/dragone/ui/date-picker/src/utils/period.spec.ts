import { NgpNativeDateAdapter } from 'ng-primitives/date-time';

import { findNearestEnabledDate, setMonthClamped, setYearClamped } from './period';

describe(setYearClamped, () => {
  const adapter = new NgpNativeDateAdapter();

  it('sets the year preserving month and day', () => {
    const result = setYearClamped(adapter, new Date(2020, 4, 15), 2030);
    expect(result.getFullYear()).toBe(2030);
    expect(result.getMonth()).toBe(4);
    expect(result.getDate()).toBe(15);
  });

  it('clamps February 29 to February 28 in a non-leap target year', () => {
    const result = setYearClamped(adapter, new Date(2024, 1, 29), 2025);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(28);
  });

  it('keeps February 29 when the target year is a leap year', () => {
    const result = setYearClamped(adapter, new Date(2024, 1, 29), 2028);
    expect(result.getDate()).toBe(29);
  });
});

describe(setMonthClamped, () => {
  const adapter = new NgpNativeDateAdapter();

  it('sets the month preserving year and day', () => {
    const result = setMonthClamped(adapter, new Date(2026, 7, 25), 0);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(25);
  });

  it('clamps January 31 to February 28 in a non-leap target year', () => {
    const result = setMonthClamped(adapter, new Date(2025, 0, 31), 1);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(28);
  });

  it('clamps January 31 to February 29 in a leap target year', () => {
    const result = setMonthClamped(adapter, new Date(2024, 0, 31), 1);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(29);
  });
});

describe(findNearestEnabledDate, () => {
  const adapter = new NgpNativeDateAdapter();
  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  it('returns the date unchanged when it is enabled', () => {
    const date = new Date(2026, 8, 7); // Monday
    expect(findNearestEnabledDate(adapter, date, isWeekend)).toEqual(date);
  });

  it('moves a disabled Saturday to the nearest enabled Friday', () => {
    const saturday = new Date(2026, 8, 5); // Saturday
    const result = findNearestEnabledDate(adapter, saturday, isWeekend);
    expect(result.getDay()).toBe(5); // Friday
    expect(result.getDate()).toBe(4);
  });

  it('moves a disabled Sunday to the nearest enabled Monday', () => {
    const sunday = new Date(2026, 8, 6); // Sunday
    const result = findNearestEnabledDate(adapter, sunday, isWeekend);
    expect(result.getDay()).toBe(1); // Monday
    expect(result.getDate()).toBe(7);
  });

  it('never returns a date outside the min/max bounds', () => {
    const saturday = new Date(2026, 8, 5); // Saturday
    const bounds = { min: new Date(2026, 8, 5), max: new Date(2026, 8, 5) };
    const result = findNearestEnabledDate(adapter, saturday, isWeekend, bounds);
    expect(result).toEqual(saturday);
  });

  it('returns the original date when no enabled date exists within the bounds', () => {
    const date = new Date(2026, 8, 5);
    const allDisabled = () => true;
    const bounds = { min: new Date(2026, 8, 1), max: new Date(2026, 8, 30) };
    expect(findNearestEnabledDate(adapter, date, allDisabled, bounds)).toEqual(date);
  });
});
