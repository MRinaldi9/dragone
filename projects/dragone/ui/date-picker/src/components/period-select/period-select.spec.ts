import { Component, signal } from '@angular/core';
import { render } from '@wismaz/vitest-browser-angular';
import { ngpDatePicker, provideDatePickerState } from 'ng-primitives/date-picker';
import { userEvent } from 'vitest/browser';

import { provideDragoneDatePickerConfig } from '../../providers/date-picker-config';
import {
  datePickerDragoneStateFactory,
  provideDatePickerDragoneState
} from '../../state/date-picker-state';
import type { IETFLanguageTag } from '../../utils/guards';
import { CalendarPeriodSelect, DEFAULT_YEAR_RANGE, type CalendarPeriodUnit } from './period-select';

/**
 * Test Host: provides the date picker state and the Dragone state consumed by
 * `CalendarPeriodSelect`, and instantiates both primitive factories so the shared state signals are
 * populated. Exposes the state so tests can drive `focusedDate` through its setter, the `min`/`max`
 * bounds through the signals passed to the factory (the state mirrors them as read-only `Signal`s),
 * and the `unit` from the parent context.
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
    provideDatePickerDragoneState({ inherit: false })
  ]
})
class TestHost {
  /** Bounds fed to the primitive factory; the state exposes read-only `Signal` mirrors of them. */
  readonly min = signal<Date | undefined>(undefined);
  readonly max = signal<Date | undefined>(undefined);
  // `min`/`max` must be initialized first: the factory captures these signals by reference.
  readonly state = ngpDatePicker<Date>({ min: this.min, max: this.max });
  readonly unit = signal<CalendarPeriodUnit>('year');
  readonly value = signal<number | null>(null);
  onPeriodSelected = vi.fn<(value: number) => void>();

  constructor() {
    datePickerDragoneStateFactory<Date>({
      locale: signal<IETFLanguageTag | undefined>(undefined),
      options: signal<Intl.DateTimeFormatOptions | undefined>(undefined),
      keepInvalid: signal(true),
      showToday: signal(true)
    });
  }
}

/** `focusedDate` is readonly on the state; tests move focus through the setter. */
function focus(host: TestHost, date: Date): void {
  host.state.setFocusedDate(date, 'program', 'forward');
}

/** The select's combobox — the only one in the page (stale hosts are torn down between tests). */
function combobox(): HTMLElement {
  const element = document.querySelector<HTMLElement>('[role="combobox"]');
  if (!element) {
    throw new Error('No combobox found.');
  }
  return element;
}

/**
 * The dropdown panel the select currently has open.
 *
 * Dropdowns portal to `document.body`, and a fixture torn down while its dropdown is still closing
 * leaves the previous test's panel behind for a few frames — sometimes re-appended after the
 * current one. The panel is therefore always resolved through the open combobox's `aria-controls`
 * (the id ng-primitives binds on the dropdown), never by DOM order.
 */
function openPanel(): HTMLElement {
  for (const trigger of document.querySelectorAll<HTMLElement>('[role="combobox"]')) {
    const panelId = trigger.getAttribute('aria-controls');
    const panel = panelId ? document.getElementById(panelId) : null;
    if (panel) {
      return panel;
    }
  }
  throw new Error('The dropdown panel is not open.');
}

/** The option elements rendered in the open panel (see {@link openPanel}). */
function panelOptions(): HTMLElement[] {
  return [...openPanel().querySelectorAll<HTMLElement>('[ngpSelectOption]')];
}

/** Options rendered in the open dropdown, in display order. */
function renderedOptions(): string[] {
  return panelOptions().map(option => option.textContent?.trim() ?? '');
}

/** Wait until the open panel renders an option labelled `name`, and return it. */
async function waitOption(name: string | RegExp): Promise<HTMLElement> {
  return await vi.waitFor(() => {
    const option = panelOptions().find(element => {
      const label = element.textContent?.trim() ?? '';
      return typeof name === 'string' ? label === name : name.test(label);
    });
    if (!option) {
      throw new Error(`Option ${String(name)} is not rendered yet.`);
    }
    return option;
  });
}

/**
 * Click the option labelled `name` and wait for the dropdown to finish closing. A click on the
 * combobox before `aria-expanded` flips back to `false` toggles the still-open select closed
 * instead of reopening it.
 */
async function selectOption(name: string | RegExp): Promise<void> {
  await userEvent.click(await waitOption(name));
  await vi.waitFor(() => {
    expect(combobox().getAttribute('aria-expanded')).toBe('false');
  });
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
      await waitOption(String(currentYear));

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
      await selectOption('2020');

      // Reopen the select: the range must NOT follow the selected year.
      await locator.getByRole('combobox').click();
      await waitOption(String(new Date().getFullYear()));

      const currentYear = new Date().getFullYear();
      const years = renderedOptions().map(Number);
      expect(years[0]).toBe(currentYear);
      expect(years.at(-1)).toBe(currentYear - DEFAULT_YEAR_RANGE);
    });

    it('moves focusedDate to the selected year and emits periodSelected', async () => {
      const { host, locator } = await setup();
      focus(host, new Date(2026, 7, 25));

      await locator.getByRole('combobox').click();
      await selectOption('2020');

      const focused = host.state.focusedDate();
      expect(focused.getFullYear()).toBe(2020);
      expect(focused.getMonth()).toBe(7);
      expect(host.onPeriodSelected).toHaveBeenCalledWith(2020);
    });

    it('clamps February 29 to February 28 when selecting a non-leap year', async () => {
      const { host, locator } = await setup();
      focus(host, new Date(2024, 1, 29));

      await locator.getByRole('combobox').click();
      await selectOption('2025');

      const focused = host.state.focusedDate();
      expect(focused.getFullYear()).toBe(2025);
      expect(focused.getMonth()).toBe(1);
      expect(focused.getDate()).toBe(28);
    });

    it('bounds the list with min and max', async () => {
      const { host, locator } = await setup();
      focus(host, new Date(2026, 7, 25));
      host.min.set(new Date(2020, 0, 1));
      host.max.set(new Date(2030, 11, 31));

      await locator.getByRole('combobox').click();
      await waitOption('2030');

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
      await waitOption(/agosto/i);

      const months = renderedOptions();
      expect(months).toHaveLength(12);
      expect(months[7].toLowerCase()).toContain('agosto'); // It-IT August
    });

    it('moves focusedDate to the selected month and emits periodSelected', async () => {
      const { host, locator } = await setup();
      host.unit.set('month');
      focus(host, new Date(2026, 7, 25));

      await locator.getByRole('combobox').click();
      await selectOption(/gennaio/i);

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
      await selectOption(/febbraio/i);

      const focused = host.state.focusedDate();
      expect(focused.getFullYear()).toBe(2025);
      expect(focused.getMonth()).toBe(1);
      expect(focused.getDate()).toBe(28);
    });
  });
});
