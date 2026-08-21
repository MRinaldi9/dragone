import { Component, input } from '@angular/core';

import { Status, Theme } from '@dragone/ui/utils';

@Component({
  selector: 'drgn-tag',
  template: ` <ng-content /> `,
  styleUrl: './tag.css',
  host: {
    class: 'drgn-label-md-700',
    role: 'status',
    '[ariaLabel]': 'ariaLabel()',
  },
  hostDirectives: [
    { directive: Status, inputs: ['drgnStatus:status'] },
    { directive: Theme, inputs: ['theme'] },
  ],
})
export class Tag {
  readonly ariaLabel = input<string>();
}
