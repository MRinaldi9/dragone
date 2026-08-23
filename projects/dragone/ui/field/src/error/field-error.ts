import { Directive } from '@angular/core';
import { NgpError } from 'ng-primitives/form-field';

@Directive({
  selector: '[drgnFieldError]',
  hostDirectives: [{ directive: NgpError, inputs: ['ngpErrorValidator:validator'] }],
})
export class FieldError {}
