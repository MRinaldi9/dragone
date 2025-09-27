import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';

export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';

@Component({
  selector: 'button[drgn-button]',
  template: `
    <ng-content select="[slot='leading']" />
    <ng-content />
    <ng-content select="[slot='trailing']" />
  `,
  styleUrl: './button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-size]': 'size()',
    '[attr.data-variant]': 'variant()',
  },
  hostDirectives: [{ directive: NgpButton, inputs: ['disabled'] }],
})
export class Button {
  readonly size = input<ButtonSize>('large');
  readonly variant = input<ButtonVariant>('primary');
}
