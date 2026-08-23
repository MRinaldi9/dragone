import { booleanAttribute, Component, effect, inject, input } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpFocus, NgpFocusVisible } from 'ng-primitives/interactions';

import {
  injectStatusState,
  Logger,
  provideLogger,
  Status,
  Theme,
  type StatusType,
} from '@dragone/ui/utils';

export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonSemantic = 'primary' | 'secondary' | 'tertiary' | 'ghost';

const SUPPORTED_STATUSES: Record<ButtonSemantic, readonly StatusType[]> = {
  primary: ['neutral', 'danger'],
  secondary: ['neutral'],
  tertiary: ['neutral', 'danger'],
  ghost: ['neutral', 'danger'],
};

@Component({
  selector: 'button[drgnButton],button[drgn-button]',
  template: `
    <ng-content select="[slot='leading']" />
    <span [class]="labelClass()">
      <ng-content />
    </span>
    <ng-content select="[slot='trailing']" />
  `,
  styleUrl: './button.css',
  ...(ngDevMode ? { providers: [provideLogger(Button.name)] } : {}),
  host: {
    '[attr.data-size]': 'size()',
    '[attr.data-semantic]': 'semantic()',
    '[attr.data-icon-only]': 'isIconOnly() ? "" : null',
  },
  hostDirectives: [
    { directive: NgpButton, inputs: ['disabled'] },
    {
      directive: NgpFocusVisible,
      inputs: ['ngpFocusVisibleDisabled:focusVisibleDisabled'],
      outputs: ['ngpFocusVisible:focusVisible'],
    },
    {
      directive: Theme,
      inputs: ['theme'],
    },
    {
      directive: Status,
      inputs: ['drgnStatus:status'],
    },
    NgpFocus,
  ],
})
export class Button {
  /** The size of the button */
  readonly size = input<ButtonSize>('large');
  /** The semantic of the button */
  readonly semantic = input<ButtonSemantic>('primary');
  /** Whether the button is an icon-only button */
  readonly isIconOnly = input(false, { transform: booleanAttribute, alias: 'icon' });
  /**
   * Class applied to the button label.
   *
   * @default 'drgn-label-md-700'
   */
  readonly labelClass = input('drgn-label-md-700');
  readonly #statusState = injectStatusState();

  constructor() {
    if (ngDevMode) {
      const logger = inject(Logger);
      effect(() => {
        const semantic = this.semantic();
        const status = this.#statusState().status();
        if (!SUPPORTED_STATUSES[semantic].includes(status)) {
          logger.warn(`The semantic "${semantic}" does not support the status "${status}".`);
        }
      });
    }
  }
}
