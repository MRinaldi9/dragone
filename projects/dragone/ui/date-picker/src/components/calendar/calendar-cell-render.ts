import { Directive } from '@angular/core';
import { NgpDatePickerCellRender } from 'ng-primitives/date-picker';

/**
 * Concrete context type for the calendar cell template.
 *
 * `NgpDatePickerCellContext<T>` is not exported from ng-primitives, so we declare an equivalent
 * interface with the concrete date type that Dragone supports.
 */
export interface DrgnCalendarCellContext {
  $implicit: Temporal.PlainDateTime | Date;
}

/**
 * Structural directive that renders a cell in the Dragone calendar grid.
 *
 * Delegates all rendering logic to {@link NgpDatePickerCellRender} via `hostDirectives`. The host
 * directive inherits the same `<ng-template>` element, so its constructor injects `TemplateRef`,
 * `ViewContainerRef`, and `injectDatePickerWeek()` exactly as if it were applied directly.
 *
 * The only reason this wrapper exists is to provide a **non-generic** `ngTemplateContextGuard`. The
 * primitive's guard is `<T>(…): context is NgpDatePickerCellContext<T>`, but `T` cannot be inferred
 * at template-check time (the directive has no inputs — the date list arrives via DI). The checker
 * therefore falls back to `NgpDatePickerCellRender<any>`, making `$implicit` — and consequently
 * `let date` — typed as `any`.
 *
 * This directive's guard pins the context to the concrete union type `Temporal.PlainDateTime |
 * Date`, so `date` is properly typed in the template.
 *
 * @example
 *
 * ```html
 * <td *drgnCalendarCellRender="let date" ngpDatePickerCell>
 *   <button ngpDatePickerDateButton>{{ adapter.getDate(date) }}</button>
 * </td>
 * ```
 */
@Directive({
  selector: '[drgnCalendarCellRender]',
  standalone: true,
  hostDirectives: [NgpDatePickerCellRender],
})
export class DrgnCalendarCellRender {
  /* Make sure the template checker knows the type of the context with which the
  template of this directive will be rendered. The primitive's guard is
  generic (<T>) but T cannot be inferred (no inputs), so the checker falls
  back to `any`. This non-generic guard pins the context to the concrete
  union type that Dragone supports.
  */
  static ngTemplateContextGuard(
    _: DrgnCalendarCellRender,
    context: unknown,
  ): context is DrgnCalendarCellContext {
    return true;
  }
}
