import { Component, signal } from '@angular/core';
import { render } from '@wismaz/vitest-browser-angular';
import { ngpDatePicker, provideDatePickerState } from 'ng-primitives/date-picker';
import { page } from 'vitest/browser';

import { provideDragoneDatePickerConfig } from '../../providers/date-picker-config';
import {
  datePickerDragoneStateFactory,
  provideDatePickerDragoneState,
} from '../../state/date-picker-state';
import type { IETFLanguageTag } from '../../utils/guards';
import { CalendarPeriodSelect, DEFAULT_YEAR_RANGE, type CalendarPeriodUnit } from './period-select';

/**
 * Test Host: provides the date picker state and the Dragone state consumed by
 * `CalendarPeriodSelect`, and instantiates both primitive factories so the shared state signals are
 * populated. Exposes the state so tests can drive `focusedDate`/`min`/`max` and the `unit` from the
 * parent context.
 */
@Component({
  imports: [CalendarPeriodSelect],
  template: `
    <drgn-calendar-period-select
      [unit]="unit()"
      [value]="value()"
      (periodSelected)="onPeriodSelected($event)"
    />
  `,
  providers: [
    provideDatePickerState(),
    provideDragoneDatePickerConfig(),
    provideDatePickerDragoneState({ inherit: false }),
  ],
})
class TestHost {
  readonly state = ngpDatePicker({});
  readonly unit = signal<CalendarPeriodUnit>('year');
  readonly value = signal<number | null>(null);
  onPeriodSelected = vi.fn<(value: number) => void>();

  constructor() {
    datePickerDragoneStateFactory({
      locale: signal<IETFLanguageTag | undefined>(undefined),
      options: signal<Intl.DateTimeFormatOptions | undefined>(undefined),
      keepInvalid: signal(true),
      showToday: signal(true),
    });
  }
}

/** `focusedDate` is readonly on the state; tests move focus through the setter. */
function focus(host: TestHost, date: Date): void {
  host.state.setFocusedDate(date, 'program', 'forward');
}

/** Options rendered in the most recent dropdown (portals from other tests may linger). */
function renderedOptions(): string[] {
  const listboxes = [...document.querySelectorAll<HTMLElement>('[role="listbox"]')];
  const current = listboxes.at(-1);
  if (!current) {
    return [];
  }
  return [...current.querySelectorAll<HTMLElement>('[ngpSelectOption]')].map(
    option => option.textContent?.trim() ?? '',
  );
}

describe(CalendarPeriodSelect, () => {
  const setup = async () => {
    const result = await render(TestHost, {});
    const host = result.componentClassInstance as unknown as TestHost;
    return { ...result, host };
  };

  describe('year unit', () => {
    it('renders the bounded year range around the current year', async () => {
      const { host, locator } = await setup();
      focus(host, new Date(2026, 7, 25));

      await locator.getByRole('combobox').click();

      const currentYear = new Date().getFullYear();
      // Wait for the dropdown to render before reading its options, so the assertion
      // never races the portal mount (flaky under slow CI machines).
      await expect
        .element(page.getByRole('option', { name: String(currentYear) }).first())
        .toBeVisible();

      const years = renderedOptions().map(Number);
      expect(years).toContain(currentYear);
      expect(years[0]).toBe(currentYear); // Descending: max (current) year first
      expect(years.at(-1)).toBe(currentYear - DEFAULT_YEAR_RANGE);
    });

    it('keeps the default range anchored to the current year after selecting a year', async () => {
      const { host, locator } = await setup();
      focus(host, new Date(2026, 7, 25));

      // Select a year far from the current one.
      await locator.getByRole('combobox').click();
      await page.getByRole('option', { name: '2020' }).last().click();

      // Reopen the select: the range must NOT follow the selected year.
      await locator.getByRole('combobox').click();

      const currentYear = new Date().getFullYear();
      // Wait for the reopened dropdown to render before reading its options, so the
      // assertion never races the portal mount (flaky under slow CI machines).
      await expect
        .element(page.getByRole('option', { name: String(currentYear) }).first())
        .toBeVisible();

      const years = renderedOptions().map(Number);
      expect(years[0]).toBe(currentYear);
      expect(years.at(-1)).toBe(currentYear - DEFAULT_YEAR_RANGE);
    });

    it('moves focusedDate to the selected year and emits periodSelected', async () => {
      const { host, locator } = await setup();
      focus(host, new Date(2026, 7, 25));

      await locator.getByRole('combobox').click();
      await page.getByRole('option', { name: '2020' }).last().click();

      const focused = host.state.focusedDate();
      expect(focused.getFullYear()).toBe(2020);
      expect(focused.getMonth()).toBe(7);
      expect(host.onPeriodSelected).toHaveBeenCalledWith(2020);
    });

    it('clamps February 29 to February 28 when selecting a non-leap year', async () => {
      const { host, locator } = await setup();
      focus(host, new Date(2024, 1, 29));

      await locator.getByRole('combobox').click();
      await page.getByRole('option', { name: '2025' }).last().click();

      const focused = host.state.focusedDate();
      expect(focused.getFullYear()).toBe(2025);
      expect(focused.getMonth()).toBe(1);
      expect(focused.getDate()).toBe(28);
    });

    it('bounds the list with min and max', async () => {
      const { host, locator } = await setup();
      focus(host, new Date(2026, 7, 25));
      host.state.min.set(new Date(2020, 0, 1));
      host.state.max.set(new Date(2030, 11, 31));

      await locator.getByRole('combobox').click();

      const years = renderedOptions().map(Number);
      expect(years.every(year => year >= 2020 && year <= 2030)).toBeTruthy();
    });
  });

  describe('month unit', () => {
    it('renders 12 localized month options', async () => {
      const { host, locator } = await setup();
      host.unit.set('month');
      focus(host, new Date(2026, 7, 25));

      await locator.getByRole('combobox').click();

      const months = renderedOptions();
      expect(months).toHaveLength(12);
      expect(months[7].toLowerCase()).toContain('agosto'); // It-IT August
    });

    it('moves focusedDate to the selected month and emits periodSelected', async () => {
      const { host, locator } = await setup();
      host.unit.set('month');
      focus(host, new Date(2026, 7, 25));

      await locator.getByRole('combobox').click();
      await page
        .getByRole('option', { name: /gennaio/i })
        .last()
        .click();

      const focused = host.state.focusedDate();
      expect(focused.getFullYear()).toBe(2026);
      expect(focused.getMonth()).toBe(0);
      expect(host.onPeriodSelected).toHaveBeenCalledWith(0);
    });

    it('clamps January 31 to February 28 when selecting February in a non-leap year', async () => {
      const { host, locator } = await setup();
      host.unit.set('month');
      focus(host, new Date(2025, 0, 31));

      await locator.getByRole('combobox').click();
      await page
        .getByRole('option', { name: /febbraio/i })
        .last()
        .click();

      const focused = host.state.focusedDate();
      expect(focused.getFullYear()).toBe(2025);
      expect(focused.getMonth()).toBe(1);
      expect(focused.getDate()).toBe(28);
    });
  });
});
