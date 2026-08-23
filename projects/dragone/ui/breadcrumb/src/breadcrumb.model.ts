import type { RouterLink } from '@angular/router';

export type BreadcrumbItemConfig =
  | BreadcrumbRouterLinkItem
  | BreadcrumbHrefItem
  | BreadcrumbCurrentPageItem;

export interface BreadcrumbRouterLinkItem {
  label: string;
  routerLink: RouterLink['routerLink'];
  icon?: string;
  href?: never;
}

export interface BreadcrumbHrefItem {
  label: string;
  href: string;
  /**
   * Specifies where to open the linked document.
   *
   * @default '_self'
   */
  target?: '_self' | '_blank';
  icon?: string;
  routerLink?: never;
}

export interface BreadcrumbCurrentPageItem {
  label: string;
  icon?: string;
  routerLink?: never;
  href?: never;
}
