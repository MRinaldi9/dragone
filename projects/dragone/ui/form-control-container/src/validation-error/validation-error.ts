import { Directive } from '@angular/core';
import { NgpError } from 'ng-primitives/form-field';

@Directive({
  selector: '[drgnError]',
  hostDirectives: [{ directive: NgpError, inputs: ['ngpErrorValidator:validator'] }],
})
export class ValidationError {}
