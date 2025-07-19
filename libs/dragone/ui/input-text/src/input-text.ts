import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpInput } from 'ng-primitives/input';
@Component({
  selector: 'input[drgn-input-text]',
  template: ``,
  styles: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    type: 'text',
  },
  hostDirectives: [{ directive: NgpInput, inputs: ['disabled'] }],
})
export class InputText {}
