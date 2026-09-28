import { booleanAttribute, Directive, input } from '@angular/core';

@Directive({
  selector: '[drgnBusy]',
  host: {
    '[attr.inert]': 'busy() ? "" : null',
    '[attr.aria-busy]': 'busy()'
  }
})
export class Busy {
  /**
   * Whether the host region is blocked (e.g. while a loader overlay covers it): sets `inert` and
   * `aria-busy` together so keyboard, pointer, and screen-reader users consistently cannot reach
   * the region. A bare `drgnBusy` attribute counts as `true`.
   *
   * @default false
   */
  readonly busy = input<boolean, boolean | ''>(false, {
    alias: 'drgnBusy',
    transform: booleanAttribute
  });
}
