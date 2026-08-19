import { Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { NgpBreadcrumbSeparator } from 'ng-primitives/breadcrumbs';

const SEPARATOR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7 12" fill="none">
  <path d="M0 11.28L4.56 0L6.096 0.56L1.52 11.824L0 11.28Z" fill="currentColor"/>
</svg>`;

@Component({
  selector: 'drgn-breadcrumb-separator',
  imports: [NgIcon],
  template: ` <ng-icon [svg]="svg" /> `,
  styleUrl: './breadcrumb-separator.css',
  hostDirectives: [NgpBreadcrumbSeparator],
})
export class BreadcrumbSeparator {
  protected readonly svg = SEPARATOR_SVG;
}
