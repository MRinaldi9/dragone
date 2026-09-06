import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { render } from '@wismaz/vitest-browser-angular';
import { userEvent } from 'vitest/browser';

import { TemporalAdapter } from '@dragone/ui/temporal-adapter';

import { DatePicker } from './date-picker';
import { provideDragoneDatePickerConfig } from './providers/date-picker-config';

const isWeekend = (date: Temporal.PlainDateTime) => date.dayOfWeek === 6 || date.dayOfWeek === 7;

/** Day-of-month of the nearest date to `date` that is not disabled. */
function nearestEnabledDay(
  date: Temporal.PlainDateTime,
  isDisabled: (date: Temporal.PlainDateTime) => boolean,
): number {
  if (!isDisabled(date)) {
    return date.day;
  }
  for (let offset = 1; ; offset += 1) {
    const previous = date.subtract({ days: offset });
    const next = date.add({ days: offset });
    if (!isDisabled(previous)) {
      return previous.day;
    }
    if (!isDisabled(next)) {
      return next.day;
    }
  }
}

@Component({
  imports: [DatePicker],
  template: `<drgn-date-picker [dateDisabled]="dateDisabled" />`,
  providers: [provideDragoneDatePickerConfig({ adapter: TemporalAdapter })],
})
class DatePickerTest {
  dateDisabled = vi.fn<(date: Temporal.PlainDateTime) => boolean>(isWeekend);
}

describe(DatePicker, () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [DatePicker],
      providers: [provideDragoneDatePickerConfig({ adapter: TemporalAdapter })],
    }).compileComponents();

    const fixture = TestBed.createComponent(DatePicker);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should call dateDisabled for each rendered day when the calendar popover opens', async () => {
    const { locator, getByRole, componentClassInstance } = await render(DatePickerTest);

    await userEvent.click(locator.getByRole('button', { name: 'Scegli Data' }));

    // The calendar renders inside a CDK overlay, outside the component container,
    // so query the document-scoped selectors (baseElement = document.body).
    await expect.element(getByRole('button', { name: /^\d+$/ }).first()).toBeVisible();

    expect(componentClassInstance.dateDisabled).toHaveBeenCalledWith(
      expect.any(Temporal.PlainDateTime),
    );
  });

  it('should move the focused date to the nearest enabled date when today is disabled', async () => {
    const { locator, getByRole } = await render(DatePickerTest);

    await userEvent.click(locator.getByRole('button', { name: 'Scegli Data' }));

    await expect.element(getByRole('button', { name: /^\d+$/ }).first()).toBeVisible();

    const focusedButton = document.querySelector('[ngpDatePickerDateButton][tabindex="0"]');
    expect(focusedButton, 'a focused date button must exist').toBeTruthy();
    expect(focusedButton?.hasAttribute('disabled')).toBeFalsy();

    // The focused date must be the nearest enabled day to today.
    const today = Temporal.Now.plainDateTimeISO();
    const focusedDay = Number(focusedButton?.textContent?.trim());
    expect(focusedDay).toBe(nearestEnabledDay(today, isWeekend));
  });

  it('should keep focus inside the popover when the focused date is disabled', async () => {
    const { locator, getByRole } = await render(DatePickerTest);

    await userEvent.click(locator.getByRole('button', { name: 'Scegli Data' }));

    await expect.element(getByRole('button', { name: /^\d+$/ }).first()).toBeVisible();

    // The focus trap applies the initial focus in `afterNextRender`, so poll until
    // the active element lands inside the calendar.
    await expect
      .poll(() => {
        const active = document.activeElement;
        const calendar = document.querySelector('drgn-calendar');
        return calendar?.contains(active) ?? false;
      })
      .toBeTruthy();
  });
});
