import { Component, signal } from '@angular/core';
import { render } from '@wismaz/vitest-browser-angular';
import { ngpDatePicker, provideDatePickerState } from 'ng-primitives/date-picker';

import { provideDragoneDatePickerConfig } from '../../providers/date-picker-config';
import {
  datePickerDragoneStateFactory,
  provideDatePickerDragoneState,
} from '../../state/date-picker-state';
import type { IETFLanguageTag } from '../../utils/guards';
import { Calendar } from './calendar';

/**
 * Test Host: provides the date picker state and the Dragone state consumed by `Calendar`, and
 * instantiates both primitive factories so the shared state signals are populated.
 */
@Component({
  imports: [Calendar],
  template: `<drgn-calendar />`,
  providers: [
    provideDatePickerState(),
    provideDragoneDatePickerConfig(),
    provideDatePickerDragoneState({ inherit: false }),
  ],
})
class CalendarTestHost {
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

describe(Calendar, () => {
  it('should create', async () => {
    const { container } = await render(CalendarTestHost);
    expect(container.querySelector('drgn-calendar')).toBeTruthy();
  });
});
