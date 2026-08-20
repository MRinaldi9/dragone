import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { NgpBreadcrumbLink, NgpBreadcrumbPage } from 'ng-primitives/breadcrumbs';
import { NgpFocusVisible } from 'ng-primitives/interactions';

import type { BreadcrumbItemConfig } from '../breadcrumb.model';
@Component({
  selector: 'drgn-breadcrumb-item',
  imports: [RouterLink, NgIcon, NgpFocusVisible, NgpBreadcrumbPage, NgpBreadcrumbLink],
  template: `
    @let config = breadcrumbConfiguration();
    @if (config.icon) {
      <ng-icon data-testid="breadcrumb-icon" [svg]="config.icon" />
    }
    @if (config.href) {
      <a
        ngpFocusVisible
        ngpBreadcrumbLink
        [target]="config.target ?? '_self'"
        [href]="config.href"
        [attr.rel]="config.target === '_blank' ? 'noopener noreferrer' : null"
        [attr.aria-current]="isLastBreadcrumb() ? 'page' : null"
        >{{ config.label }}</a
      >
    } @else if (config.routerLink) {
      <a
        ngpFocusVisible
        ngpBreadcrumbLink
        [routerLink]="config.routerLink"
        [attr.aria-current]="isLastBreadcrumb() ? 'page' : null"
      >
        {{ config.label }}
      </a>
    } @else {
      <span ngpBreadcrumbPage>
        {{ config.label }}
      </span>
    }
  `,
  styleUrl: './breadcrumb-item.css',
  host: {
    role: 'listitem',
  },
})
export class BreadcrumbItem {
  readonly breadcrumbConfiguration = input.required<BreadcrumbItemConfig>();
  readonly isLastBreadcrumb = input(false);
}
