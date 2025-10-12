import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpAccordion } from 'ng-primitives/accordion';

@Component({
  selector: 'drgn-accordion',
  imports: [],
  template: ` <ng-content /> `,
  styleUrl: './accordion.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: NgpAccordion,
      inputs: [
        'ngpAccordionCollapsible: collapse',
        'ngpAccordionType: type',
        'ngpAccordionDisabled: disabled',
        'ngpAccordionOrientation: orientation',
        'ngpAccordionValue: value',
      ],
      outputs: ['ngpAccordionValueChange: accordionChange'],
    },
  ],
})
export class Accordion {}
