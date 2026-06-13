import { Component, computed, input } from '@angular/core';
import { NgpAccordionContent, NgpAccordionItem } from 'ng-primitives/accordion';

import { injectThemeState, Theme } from '@dragone/ui/utils';

import { AccordionHeader, type AriaLevel } from '../accordion-header/accordion-header';

@Component({
  selector: 'drgn-accordion-item',
  imports: [NgpAccordionContent, AccordionHeader],
  template: `
    <drgn-accordion-header [ariaLevel]="headingAriaLevel()" [variant]="btnVariant()">
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
  hostDirectives: [
    {
      directive: NgpAccordionItem,
      inputs: ['ngpAccordionItemValue: value', 'ngpAccordionItemDisabled: disabled'],
    },
    {
      directive: Theme,
      inputs: ['theme:accordionVariant'],
    },
  ],
})
export class AccordionItem {
  readonly heading = input.required<string>();
  readonly headingAriaLevel = input<AriaLevel>(3);

  readonly #themeState = injectThemeState();
  readonly btnVariant = computed((theme = this.#themeState.resolvedTheme()) =>
    theme === 'dark' ? 'primary' : 'tertiary',
  );
}
