import { Component, signal } from '@angular/core';
import { render } from '@wismaz/vitest-browser-angular';
import { ngpDatePicker, provideDatePickerState } from 'ng-primitives/date-picker';
import { userEvent } from 'vitest/browser';

import { provideDragoneDatePickerConfig } from '../../providers/date-picker-config';
import {
  datePickerDragoneStateFactory,
  provideDatePickerDragoneState,
} from '../../state/date-picker-state';
import type { IETFLanguageTag } from '../../utils/guards';
import { InputDatePicker } from './input-date-picker';

/**
 * Test Host: provides the date picker state and the Dragone state consumed by `InputDatePicker`,
 * and instantiates both primitive factories so the shared state signals are populated.
 */
@Component({
  imports: [InputDatePicker],
  template: `<input date-picker />`,
  providers: [
    provideDatePickerState(),
    provideDragoneDatePickerConfig(),
    provideDatePickerDragoneState({ inherit: false }),
  ],
})
class InputDatePickerTestHost {
  readonly state = ngpDatePicker({});

  constructor() {
    datePickerDragoneStateFactory({
      locale: signal<IETFLanguageTag | undefined>(undefined),
      options: signal<Intl.DateTimeFormatOptions | undefined>(undefined),
      keepInvalid: signal(true),
      showToday: signal(true),
    });
  }
}

describe(InputDatePicker, () => {
  it('should create an instance', async () => {
    const { container } = await render(InputDatePickerTestHost);
    expect(container.querySelector('input[date-picker]')).toBeTruthy();
  });

  it('selects the parsed date when the user types a valid date', async () => {
    expect.hasAssertions();
    const { container, componentClassInstance } = await render(InputDatePickerTestHost);
    const host = componentClassInstance as unknown as InputDatePickerTestHost;
    const input = container.querySelector<HTMLInputElement>('input[date-picker]');
    expect(input).toBeTruthy();
    if (!input) {
      return;
    }

    // Type a valid date in the default it-IT format (dd/MM/yyyy).
    await userEvent.fill(input, '15/03/2026');

    // Wait for the debounced parse + effect to run.
    await vi.waitFor(() => {
      const selected = host.state.date();
      expect(selected).toBeInstanceOf(Date);
      expect(selected?.getFullYear()).toBe(2026);
      expect(selected?.getMonth()).toBe(2); // March (zero-based)
      expect(selected?.getDate()).toBe(15);
    });
  });
});
