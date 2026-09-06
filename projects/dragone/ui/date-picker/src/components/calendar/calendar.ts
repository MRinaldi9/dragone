import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidAngleLeft, faSolidAngleRight } from '@ng-icons/font-awesome/solid';
import {
  NgpDatePickerCell,
  NgpDatePickerCellRender,
  NgpDatePickerDateButton,
  NgpDatePickerGrid,
  NgpDatePickerLabel,
  NgpDatePickerNextMonth,
  NgpDatePickerPreviousMonth,
  NgpDatePickerRowRender,
} from 'ng-primitives/date-picker';
import { injectDateAdapter } from 'ng-primitives/date-time';

import { injectDatePickerDragoneState } from '../../state/date-picker-state';
import { CalendarPeriodSelect } from '../period-select/period-select';

@Component({
  selector: 'drgn-calendar',
  imports: [
    NgIcon,
    NgpDatePickerLabel,
    NgpDatePickerNextMonth,
    NgpDatePickerPreviousMonth,
    NgpDatePickerGrid,
    NgpDatePickerCell,
    NgpDatePickerRowRender,
    NgpDatePickerDateButton,
    NgpDatePickerCellRender,
    CalendarPeriodSelect,
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.css',
  providers: [
    provideIcons({
      faSolidAngleLeft,
      faSolidAngleRight,
    }),
  ],
})
export class Calendar<T> {
  protected readonly adapter = injectDateAdapter<T>();
  protected readonly datePickerDragoneState = injectDatePickerDragoneState<T>();
}
