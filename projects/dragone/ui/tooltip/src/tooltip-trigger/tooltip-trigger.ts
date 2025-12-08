import { Directive } from '@angular/core';
import { injectTooltipTriggerState, NgpTooltipTrigger } from 'ng-primitives/tooltip';
import { Tooltip } from '../tooltip/tooltip';

@Directive({
  selector: '[drgnTooltip]',
  hostDirectives: [
    {
      directive: NgpTooltipTrigger,
      inputs: [
        'ngpTooltipTriggerPlacement:tooltipPlacement',
        'ngpTooltipTriggerDisabled:tooltipDisabled',
        'ngpTooltipTriggerOffset:tooltipTriggerOffset',
        'ngpTooltipTriggerShowDelay:tooltipTriggerShowDelay',
        'ngpTooltipTriggerHideDelay:tooltipTriggerHideDelay',
        'ngpTooltipTriggerFlip:tooltipTriggerFlip',
        'ngpTooltipTriggerContainer:tooltipTriggerContainer',
        'ngpTooltipTriggerShowOnOverflow:tooltipTriggerShowOnOverflow',
        'ngpTooltipTriggerContext:tooltipContent',
      ],
    },
  ],
})
export class TooltipTrigger {
  private stateTooltip = injectTooltipTriggerState();

  constructor() {
    this.stateTooltip().tooltip.set(Tooltip);
  }
}
