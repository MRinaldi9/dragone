import { ChangeDetectionStrategy, Component, effect, inject, untracked } from '@angular/core';
import {
  injectRadioGroupState,
  injectRadioItemState,
  NgpRadioIndicator,
  NgpRadioItem,
} from 'ng-primitives/radio';

import { RadioGroup } from '../radio-group/radio-group';

@Component({
  selector: 'drgn-radio-item',
  imports: [NgpRadioIndicator],
  template: `
    <div ngpRadioIndicator name="radio-button">
      <span class="indicator-dot"></span>
    </div>
    <p class="title drgn-label-md-400">
      <ng-content />
    </p>
  `,
  styleUrl: './radio-item.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.readonly]': 'radioGroupReadonly() ? "" : null',
  },
  hostDirectives: [
    {
      directive: NgpRadioItem,
      inputs: ['ngpRadioItemValue:value', 'ngpRadioItemDisabled:disabled'],
    },
  ],
})
export class RadioItem {
  readonly #state = injectRadioItemState();
  readonly #radioGroupState = injectRadioGroupState();
  protected readonly radioGroupReadonly = inject(RadioGroup).readonly;

  constructor() {
    effect(() => {
      const internalState = untracked(() => this.#state());
      const disabled = this.#radioGroupState().disabled();
      internalState.disabled.set(disabled);
    });
    effect(() => {
      this.#radioGroupState().value();
      const isReadonly = this.radioGroupReadonly();
      if (isReadonly) untracked(() => this.#radioGroupState().value.set(null));
    });
  }
}
