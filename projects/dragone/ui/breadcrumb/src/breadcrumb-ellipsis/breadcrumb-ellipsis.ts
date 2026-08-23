import { Component, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { NgpBreadcrumbEllipsis, NgpBreadcrumbItem } from 'ng-primitives/breadcrumbs';
import { NgpFocusVisible } from 'ng-primitives/interactions';

const ELLIPSIS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 24" fill="none">
<path d="M4.21819 18V15.696H6.09019V18H4.21819ZM11.5619 18V15.696H13.4339V18H11.5619ZM18.9057 18V15.696H20.7777V18H18.9057Z" fill="currentColor"/>
</svg>`;

@Component({
  selector: 'drgn-breadcrumb-ellipsis',
  imports: [NgIcon, NgpBreadcrumbEllipsis, NgpFocusVisible],
  template: `
    <button ngpFocusVisible [ariaLabel]="ariaLabel()" (click)="openBreadcrumb.emit()">
      <ng-icon ngpBreadcrumbEllipsis [svg]="ellipsisIcon" />
    </button>
  `,
  styleUrl: './breadcrumb-ellipsis.css',
  hostDirectives: [NgpBreadcrumbItem],
})
export class BreadcrumbEllipsis {
  readonly ariaLabel = input('Expand breadcrumbs');
  readonly openBreadcrumb = output<void>();
  protected readonly ellipsisIcon = ELLIPSIS_SVG;
}
