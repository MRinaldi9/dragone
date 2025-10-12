import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Button } from '@dragone/ui/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidChevronDown, faSolidChevronUp } from '@ng-icons/font-awesome/solid';
import {
  injectAccordionItemState,
  injectAccordionState,
  NgpAccordionContent,
  NgpAccordionItem,
  NgpAccordionTrigger,
} from 'ng-primitives/accordion';

@Component({
  selector: 'drgn-accordion-item',
  imports: [NgpAccordionContent, NgpAccordionTrigger, NgIcon, Button],
  template: `
    <button
      ngpAccordionTrigger
      drgn-button
      variant="tertiary"
      class="drgn-label-md-600"
      [disabled]="isDisabled()"
    >
      {{ heading() }}
      <ng-icon slot="trailing" class="chevron-icon" name="faSolidChevronDown" />
    </button>
    <div class="drgn-p-md-01" ngpAccordionContent>
      <div class="accordion-container">
        <ng-content />
      </div>
    </div>
  `,
  styleUrl: './accordion-item.css',
  providers: [provideIcons({ faSolidChevronDown, faSolidChevronUp })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: NgpAccordionItem,
      inputs: ['ngpAccordionItemValue: value', 'ngpAccordionItemDisabled: disabled'],
    },
  ],
})
export class AccordionItem {
  readonly heading = input.required<string>();
  private readonly internalState = injectAccordionItemState();
  private readonly accordionState = injectAccordionState();

  protected readonly isDisabled = computed(
    () => this.internalState().disabled() || this.accordionState().disabled(),
  );
}
