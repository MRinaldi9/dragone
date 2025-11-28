import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'drgn-input-group',
  template: `
    <ng-content select="[slot='leading']" />
    <ng-content select="input" />
    <ng-content select="[slot='trailing']" />
  `,
  styleUrl: './input-group.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputGroup {}
