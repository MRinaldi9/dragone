import type { BreadcrumbItemConfig } from '../breadcrumb-item/breadcrumb-item';

export function validateBreadcrumbTrail(items: BreadcrumbItemConfig[]): string[] {
  const warnings: string[] = [];
  const last = items.at(-1);
  if (last?.href || last?.routerLink) {
    warnings.push(
      '[Dragone UI] Breadcrumb: The last breadcrumb item should not have a link (href or routerLink).',
    );
  }
  const badIndex = items.slice(0, -1).findIndex(item => !item.href && !item.routerLink);
  if (badIndex !== -1) {
    warnings.push(
      `[Dragone UI] Breadcrumb: Breadcrumb item at index ${badIndex} should have a link (href or routerLink).`,
    );
  }
  return warnings;
}
