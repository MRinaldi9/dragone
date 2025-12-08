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
        'ngpTooltipTriggerOffset:tooltipOffset',
        'ngpTooltipTriggerShowDelay:tooltipShowDelay',
        'ngpTooltipTriggerHideDelay:tooltipHideDelay',
        'ngpTooltipTriggerFlip:tooltipFlip',
        'ngpTooltipTriggerContainer:tooltipContainer',
        'ngpTooltipTriggerShowOnOverflow:tooltipShowOnOverflow',
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
