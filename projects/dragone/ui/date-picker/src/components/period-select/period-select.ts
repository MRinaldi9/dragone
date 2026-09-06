import { Component, computed, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidChevronDown } from '@ng-icons/font-awesome/solid';
import { injectDateAdapter } from 'ng-primitives/date-time';
import {
  injectSelectState,
  NgpSelect,
  NgpSelectDropdown,
  NgpSelectOption,
  NgpSelectPortal,
} from 'ng-primitives/select';

import { isNil } from '@dragone/ui/utils';

import { injectDatePickerDragoneState } from '../../state/date-picker-state';
import { setMonthClamped, setYearClamped } from '../../utils/period';

/** The calendar period a `CalendarPeriodSelect` edits on the focused date. */
export type CalendarPeriodUnit = 'year' | 'month';

/**
 * Number of years on each side of the anchor used to build the default (unbounded) list. A select
 * needs a finite option list, so a missing `min`/`max` falls back to this window.
 */
export const DEFAULT_YEAR_RANGE = 100;

@Component({
  selector: 'drgn-calendar-period-select',
  imports: [NgIcon, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal],
  templateUrl: './period-select.component.html',
  styleUrl: './period-select.css',
  providers: [
    provideIcons({
      faSolidChevronDown,
    }),
  ],
  hostDirectives: [
    {
      directive: NgpSelect,
      inputs: ['ngpSelectValue:value', 'ngpSelectDisabled:disabled', 'ngpSelectOptions:options'],
      outputs: ['ngpSelectValueChange:valueChange'],
    },
  ],
})
export class CalendarPeriodSelect<T> {
  /** The calendar period this select edits on the focused date. */
  readonly unit = input<CalendarPeriodUnit>('year');

  /** Emitted with the selected unit value (zero-based month 0-11, or the year). */
  readonly periodSelected = output<number>();

  readonly #adapter = injectDateAdapter<T>();
  readonly #selectState = injectSelectState<number>();
  readonly #datePickerDragoneState = injectDatePickerDragoneState<T>();

  /**
   * The current year — the stable anchor for the default (unbounded) year range.
   *
   * Captured once at component creation so the range never follows the focused date: the popover
   * recreates this component on every open, so anchoring to the focused value would make the
   * selected year the new `max` (and re-derive `min` from it) on each reopen.
   */
  readonly #currentYear = this.#adapter.getYear(this.#adapter.now());

  /** The current value of the selected unit on the focused date. */
  protected readonly focusedValue = computed(() => {
    const focused = this.#datePickerDragoneState().focusedDate() ?? this.#adapter.now();
    return this.unit() === 'year'
      ? this.#adapter.getYear(focused)
      : this.#adapter.getMonth(focused);
  });

  protected readonly effectiveMinYear = computed(() => {
    const min = this.#datePickerDragoneState().min();
    return min ? this.#adapter.getYear(min) : this.#currentYear - DEFAULT_YEAR_RANGE;
  });

  protected readonly effectiveMaxYear = computed(() => {
    const max = this.#datePickerDragoneState().max();
    return max ? this.#adapter.getYear(max) : this.#currentYear;
  });

  protected readonly allYears = computed(() => {
    const from = this.effectiveMinYear();
    const to = this.effectiveMaxYear();
    return Array.from({ length: Math.max(0, to - from + 1) }, (_, index) => to - index);
  });

  /** The selectable options for the current unit, each with a value and a localized label. */
  protected readonly options = computed(() => {
    if (this.unit() === 'month') {
      // Zero-based (0-11) values, matching `NgpDateAdapter.getMonth`/`set` so the value can be
      // passed straight to `setMonthClamped`.
      return this.#datePickerDragoneState()
        .monthsLocale()
        .map((label, value) => ({ value, label }));
    }
    return this.allYears().map(year => ({ value: year, label: String(year) }));
  });

  /** The label shown on the trigger for the current focused value. */
  protected readonly currentLabel = computed(() => {
    const value = this.focusedValue();
    return this.options().find(option => option.value === value)?.label ?? String(value);
  });

  constructor() {
    this.#selectState()
      .valueChange.pipe(takeUntilDestroyed())
      .subscribe(this.#periodChange.bind(this));
  }

  #periodChange(value: number | undefined): void {
    const focused = this.#datePickerDragoneState().focusedDate();
    if (!focused || isNil(value)) {
      return;
    }
    const next =
      this.unit() === 'year'
        ? setYearClamped(this.#adapter, focused, value)
        : setMonthClamped(this.#adapter, focused, value);
    // SetFocusedDate applies min/max clamping and disabled-date handling on top.
    this.#datePickerDragoneState().setFocusedDate(next, 'program', 'forward');
    this.periodSelected.emit(value);
  }
}
