import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Button, ButtonVariant } from '@dragone/ui/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidChevronDown, faSolidChevronUp } from '@ng-icons/font-awesome/solid';
import {
  injectAccordionItemState,
  injectAccordionState,
  NgpAccordionTrigger,
} from 'ng-primitives/accordion';

export type AriaLevel = 1 | 2 | 3 | 4 | 5 | 6;

@Component({
  selector: 'drgn-accordion-header',
  imports: [NgIcon, NgpAccordionTrigger, Button],
  template: `
    <button
      ngpAccordionTrigger
      drgn-button
      class="drgn-label-md-600"
      [variant]="variant()"
      [disabled]="isDisabled()"
    >
      <ng-content />
      <ng-icon slot="trailing" class="chevron-icon" name="faSolidChevronDown" />
    </button>
  `,
  styleUrl: './accordion-header.css',
  providers: [provideIcons({ faSolidChevronDown, faSolidChevronUp })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'heading',
    '[ariaLevel]': 'ariaLevel()',
  },
})
export class AccordionHeader {
  readonly ariaLevel = input.required<AriaLevel>();
  readonly variant = input<ButtonVariant>('primary');
  private readonly internalState = injectAccordionItemState();
  private readonly accordionState = injectAccordionState();

  protected readonly isDisabled = computed(
    () => this.internalState().disabled() || this.accordionState().disabled(),
  );
}
