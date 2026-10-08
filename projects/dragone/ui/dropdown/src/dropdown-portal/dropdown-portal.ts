import { Directive } from '@angular/core';
import { NgpSelectPortal } from 'ng-primitives/select';

/**
 * Renders the `Dropdown` it wraps into an overlay anchored to the `DropdownTrigger`, dismissed on
 * outside click and on Escape: `<drgn-dropdown *drgnDropdownPortal>`. Declare it inside the trigger
 * element, since the overlay content resolves the trigger state through its declaration site.
 */
@Directive({
  selector: '[drgnDropdownPortal]',
  hostDirectives: [NgpSelectPortal]
})
export class DropdownPortal {}
