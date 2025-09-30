import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpFocusVisible } from 'ng-primitives/interactions';

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
    '[attr.data-icon-only]': 'isIconOnly()',
    class: 'drgn-label-md-700',
  },
  hostDirectives: [
    { directive: NgpButton, inputs: ['disabled'] },
    {
      directive: NgpFocusVisible,
      inputs: ['ngpFocusVisibleDisabled:focusVisibleDisabled'],
      outputs: ['ngpFocusVisible:focusVisible'],
    },
  ],
})
export class Button {
  /** The size of the button */
  readonly size = input<ButtonSize>('large');
  /** The variant of the button */
  readonly variant = input<ButtonVariant>('primary');
  /** Whether the button is an icon-only button */
  readonly isIconOnly = input(false, { transform: booleanAttribute, alias: 'icon' });
}
