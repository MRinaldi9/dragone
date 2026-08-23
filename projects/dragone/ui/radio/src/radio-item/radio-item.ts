import { Component, effect, untracked } from '@angular/core';
import { injectRadioGroupState, NgpRadioIndicator, NgpRadioItem } from 'ng-primitives/radio';

import { createNotifier } from '@dragone/ui/utils';

import { injectRadioGroupContext } from '../radio-group-context';

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
  protected readonly radioGroupReadonly = injectRadioGroupContext().readonly;
  readonly #radioGroupState = injectRadioGroupState();
  readonly #notifierRadioGroup = createNotifier({ deps: [this.#radioGroupState().value] });

  constructor() {
    effect(() => {
      this.#notifierRadioGroup.listen();
      const isReadonly = this.radioGroupReadonly();
      if (isReadonly) untracked(() => this.#radioGroupState().setValue(null));
    });
  }
}
