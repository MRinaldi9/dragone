import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'drgn-ui',
  imports: [],
  template: `
    <p>
      ui works!
    </p>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Ui {

}
