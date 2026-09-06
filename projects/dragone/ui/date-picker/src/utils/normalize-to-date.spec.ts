import { TestBed } from '@angular/core/testing';
import { NgpNativeDateAdapter } from 'ng-primitives/date-time';

import { TemporalAdapter } from '@dragone/ui/temporal-adapter';

import { normalizeToDate } from './normalize-to-date';

describe(normalizeToDate, () => {
  it('converts a native Date to an equivalent native Date', () => {
    const adapter = new NgpNativeDateAdapter();
    const date = new Date(2026, 8, 6, 14, 30, 15, 250); // Sep 6, 2026 14:30:15.250

    const result = normalizeToDate(date, adapter);

    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(8);
    expect(result.getDate()).toBe(6);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
    expect(result.getSeconds()).toBe(15);
    expect(result.getMilliseconds()).toBe(250);
  });

  it('converts a Temporal.PlainDateTime to a native Date preserving the calendar fields', () => {
    TestBed.configureTestingModule({
      providers: [TemporalAdapter],
    });
    const adapter = TestBed.inject(TemporalAdapter);
    const date = new Temporal.PlainDateTime(2026, 9, 6, 14, 30, 15, 250);

    const result = normalizeToDate(date, adapter);

    expect(result.getFullYear()).toBe(2026);
    // Temporal month is 1-indexed, the adapter exposes it zero-based (0-11)
    expect(result.getMonth()).toBe(8);
    expect(result.getDate()).toBe(6);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
    expect(result.getSeconds()).toBe(15);
    expect(result.getMilliseconds()).toBe(250);
  });

  it('produces a Date that Intl.DateTimeFormat can format for any T', () => {
    TestBed.configureTestingModule({
      providers: [TemporalAdapter],
    });
    const adapter = TestBed.inject(TemporalAdapter);
    const formatter = new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const result = formatter.format(
      normalizeToDate(new Temporal.PlainDateTime(2026, 9, 6), adapter),
    );

    expect(result).toBe('06/09/2026');
  });
});
