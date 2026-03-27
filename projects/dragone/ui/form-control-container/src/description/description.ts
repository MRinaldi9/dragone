import { Directive, input } from '@angular/core';
import { NgpDescription } from 'ng-primitives/form-field';
import { uniqueId } from 'ng-primitives/utils';

@Directive({
  selector: '[drgnDescription]',
  host: { '[id]': 'id()' },
  hostDirectives: [NgpDescription],
})
export class Description {
  readonly id = input(uniqueId('drgn-description'));
}
