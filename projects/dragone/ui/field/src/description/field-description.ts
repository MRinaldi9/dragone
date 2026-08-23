import { Directive } from '@angular/core';
import { NgpDescription } from 'ng-primitives/form-field';

@Directive({
  selector: '[drgnFieldDescription]',
  hostDirectives: [{ directive: NgpDescription, inputs: ['id'] }],
})
export class FieldDescription {}
