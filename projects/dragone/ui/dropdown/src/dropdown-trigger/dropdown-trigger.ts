import { Directive } from '@angular/core';
import { NgpSelect } from 'ng-primitives/select';

/**
 * Applied to the element that opens a `Dropdown` — a Select field, a Button, or a Link. It owns the
 * open state, the selection, and the panel placement, while the projected `Dropdown` only renders
 * the option list.
 *
 * The trigger renders `role="combobox"`, so it is queried by that role and not as a button. The
 * `Dropdown` must be declared inside this element with `drgnDropdownPortal` so it can read the
 * trigger state.
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
export class DropdownTrigger {}
