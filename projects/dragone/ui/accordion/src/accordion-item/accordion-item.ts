import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ButtonVariant } from '@dragone/ui/button';
import { NgpAccordionContent, NgpAccordionItem } from 'ng-primitives/accordion';
import { AccordionHeader, AriaLevel } from '../accordion-header/accordion-header';

@Component({
  selector: 'drgn-accordion-item',
  imports: [NgpAccordionContent, AccordionHeader],
  template: `
    <drgn-accordion-header [ariaLevel]="headingAriaLevel()" [variant]="accordionVariant()">
      {{ heading() }}
    </drgn-accordion-header>
    <div class="drgn-p-md-01" ngpAccordionContent>
      <div class="accordion-container">
        <ng-content />
      </div>
    </div>
  `,
  styleUrl: './accordion-item.css',
  providers: [],
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
  readonly headingAriaLevel = input<AriaLevel>(3);
  readonly accordionVariant = input<
    Extract<ButtonVariant, 'primary' | 'tertiary'>,
    'dark' | 'light'
  >('primary', {
    transform: v => (v === 'dark' ? 'primary' : 'tertiary'),
  });
}
