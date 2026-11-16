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
   * Whether the host region is blocked (`inert` + `aria-busy`). A bare `drgnBusy` attribute counts
   * as `true`.
   *
   * @default false
   */
  readonly busy = input<boolean, boolean | ''>(false, {
    alias: 'drgnBusy',
    transform: booleanAttribute
  });
}
