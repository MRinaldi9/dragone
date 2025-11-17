import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpRadioIndicator, NgpRadioItem } from 'ng-primitives/radio';

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
  hostDirectives: [
    {
      directive: NgpRadioItem,
      inputs: ['ngpRadioItemValue:value', 'ngpRadioItemDisabled:disabled'],
    },
  ],
})
export class RadioItem {}
