import { Directive } from '@angular/core';
import { NgpLabel } from 'ng-primitives/form-field';

@Directive({
  selector: '[drgnFieldLabel]',
  hostDirectives: [{ directive: NgpLabel, inputs: ['id'] }],
})
export class FieldLabel {}
