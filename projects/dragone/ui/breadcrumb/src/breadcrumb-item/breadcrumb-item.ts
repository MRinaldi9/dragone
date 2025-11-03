import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { NgpFocusVisible } from 'ng-primitives/interactions';

export type BreadcrumbProps =
  | BreadcrumbWithRouterLink
  | BreadcrumbWithHref
  | BreadcrumbWithEllipsis;

type BreadcrumbWithRouterLink = {
  label: string;
  routerLink: RouterLink['routerLink'];
  href?: null;
  icon?: string;
};

type BreadcrumbWithHref = {
  label: string;
  routerLink?: null;
  href: string;
  icon?: string;
};

type BreadcrumbWithEllipsis = {
  label: string;
  routerLink?: null;
  href?: null;
  icon?: null;
};

@Component({
  selector: 'drgn-breadcrumb-item',
  imports: [RouterLink, RouterLinkActive, NgIcon, NgpFocusVisible],
  template: `
    @let config = breadcrumbConfiguration();
    @if (config.icon) {
      <ng-icon [svg]="config.icon" />
    }
    @if (config.href) {
      <a ngpFocusVisible target="_blank" rel="noopener noreferrer" [href]="config.href">{{
        config.label
      }}</a>
    } @else if (config.routerLink) {
      <a
        ngpFocusVisible
        routerLinkActive="active-route"
        ariaCurrentWhenActive="page"
        [routerLinkActiveOptions]="{ exact: true }"
        [routerLink]="config.routerLink"
      >
        {{ config.label }}
      </a>
    } @else {
      <a
        ngpFocusVisible
        tabindex="0"
        (click)="breadcrumbVisualization($event)"
        (keyup)="breadcrumbVisualization($event)"
        >{{ config.label }}</a
      >
    }
  `,
  styleUrl: './breadcrumb-item.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'listitem',
  },
})
export class BreadcrumbItem {
  readonly breadcrumbConfiguration = input.required<BreadcrumbProps>();
  readonly openBreadcrumb = output();

  protected breadcrumbVisualization(event: Event) {
    event.preventDefault();
    this.openBreadcrumb.emit();
  }
}
