import { Directive } from '@angular/core';
import { NgpLabel } from 'ng-primitives/form-field';

@Directive({
  selector: '[drgnLabel]',
  hostDirectives: [{ directive: NgpLabel, inputs: ['id'] }],
})
export class Label {}
