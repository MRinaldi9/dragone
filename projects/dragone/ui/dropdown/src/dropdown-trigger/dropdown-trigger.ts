import { afterRenderEffect, Directive } from '@angular/core';
import { injectSelectState, NgpSelect } from 'ng-primitives/select';

import { injectElementRef, toNativeElement } from '@dragone/ui/utils';

/**
 * Applied to the element that opens a `Dropdown` — a Select field, a Button, or a Link. It owns the
 * open state, the selection, and the panel placement, while the projected `Dropdown` only renders
 * the option list.
 *
 * The trigger is the panel's combobox (`role="combobox"`) until a `DropdownSearch` opens: the
 * search field takes that role, and the trigger falls back to its native role. Query it by
 * `data-testid` or by role, not by role alone across both states. The `Dropdown` must be declared
 * inside this element with `drgnDropdownPortal` so it can read the trigger state.
 */
@Directive({
  selector: '[drgnDropdownTrigger]',
  hostDirectives: [
    {
      directive: NgpSelect,
      inputs: [
        'id',
        'ngpSelectValue: value',
        'ngpSelectMultiple: multiple',
        'ngpSelectDisabled: disabled',
        'ngpSelectCompareWith: compare',
        'ngpSelectDropdownPlacement: placement',
        'ngpSelectDropdownOffset: offset',
        'ngpSelectDropdownFlip: flip',
        'ngpSelectDropdownContainer: container'
      ],
      outputs: ['ngpSelectValueChange: valueChange', 'ngpSelectOpenChange: openChange']
    }
  ]
})
export class DropdownTrigger {
  readonly #state = injectSelectState();

  constructor() {
    const host = toNativeElement(injectElementRef());
    // NgpSelect makes the trigger untabbable while an ngpSelectInput is registered, because in its
    // model the input lives inside the trigger. Here the trigger is a separate control and the
    // input is in the portaled panel, so Tab must leave the panel towards the next control: with
    // tabindex="-1" the browser would restart the sequential navigation from the document top.
    afterRenderEffect(() => {
      this.#state().open();
      host.setAttribute('tabindex', this.#state().disabled() ? '-1' : '0');
    });
  }
}
