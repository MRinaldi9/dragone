import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpFocusVisible } from 'ng-primitives/interactions';
import { uniqueId } from 'ng-primitives/utils';

export type InputValidity = 'valid' | 'invalid' | 'warning';

@Component({
  selector: 'input[drgn-input-text],input[drgn-input="text"]',
  imports: [],
  template: ``,
  styleUrl: './input-text.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    type: 'text',
    class: 'drgn-label-md-400',
    '[id]': 'id()',
    '[attr.aria-invalid]': 'isInvalid()',
    '[attr.data-validation]': 'validationState()',
  },
  hostDirectives: [NgpFocusVisible],
})
export class InputText {
  readonly id = input(uniqueId('drgn-input'));
  readonly validationState = input<InputValidity | null>(null);
  readonly isInvalid = computed(() => this.validationState() === 'invalid');
}
