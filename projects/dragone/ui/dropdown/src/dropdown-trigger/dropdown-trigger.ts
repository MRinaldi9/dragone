import { afterRenderEffect, Directive } from '@angular/core';
import { injectSelectState, NgpSelect } from 'ng-primitives/select';

import { injectElementRef, toNativeElement } from '@dragone/ui/utils';

/**
 * Directive applied to the trigger element (Select, Button, or Link) that opens a `Dropdown`. Owns
 * open state, selection, and floating placement; declare `<drgn-dropdown *drgnDropdownPortal>`
 * inside the trigger element.
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
