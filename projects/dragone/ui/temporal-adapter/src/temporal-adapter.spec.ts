import { TestBed } from '@angular/core/testing';

import { TemporalAdapter } from './temporal-adapter';

describe(TemporalAdapter, () => {
  it('should get the day of the week (1-7)', () => {
    TestBed.configureTestingModule({
      providers: [TemporalAdapter],
    });
    const adapter = TestBed.inject(TemporalAdapter);
    const lastOfAugust2025 = adapter.create({ year: 2025, month: 8, day: 31 }); // Aug 31st, 2025 is a Sunday
    expect(adapter.getDay(lastOfAugust2025)).toBe(7);
    expect(adapter.getDay(adapter.add(lastOfAugust2025, { days: 1 }))).toBe(1);
    expect(adapter.getDay(adapter.add(lastOfAugust2025, { days: 2 }))).toBe(2);
    expect(adapter.getDay(adapter.add(lastOfAugust2025, { days: 3 }))).toBe(3);
    expect(adapter.getDay(adapter.add(lastOfAugust2025, { days: 4 }))).toBe(4);
    expect(adapter.getDay(adapter.add(lastOfAugust2025, { days: 5 }))).toBe(5);
    expect(adapter.getDay(adapter.add(lastOfAugust2025, { days: 6 }))).toBe(6);
    expect(adapter.getDay(adapter.add(lastOfAugust2025, { days: 7 }))).toBe(7);
  });

  it('should get the month as zero-based (0-11) per the NgpDateAdapter contract', () => {
    TestBed.configureTestingModule({
      providers: [TemporalAdapter],
    });
    const adapter = TestBed.inject(TemporalAdapter);
    const january = adapter.create({ year: 2026, month: 1, day: 15 });
    const december = adapter.create({ year: 2026, month: 12, day: 15 });

    expect(adapter.getMonth(january)).toBe(0);
    expect(adapter.getMonth(december)).toBe(11);
  });

  it('should round-trip set(date, { month: getMonth(other) })', () => {
    TestBed.configureTestingModule({
      providers: [TemporalAdapter],
    });
    const adapter = TestBed.inject(TemporalAdapter);
    const source = adapter.create({ year: 2026, month: 9, day: 6 });
    const target = adapter.create({ year: 2025, month: 1, day: 20 });

    const result = adapter.set(target, { month: adapter.getMonth(source) });

    expect(result.month).toBe(9);
    expect(result.year).toBe(2025);
    expect(result.day).toBe(20);
  });
});
