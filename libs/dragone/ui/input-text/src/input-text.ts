import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'drgn-input-text',
  imports: [],
  template: `<p class="text-red-600">input-text works!</p>`,
  styles: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputText {}
