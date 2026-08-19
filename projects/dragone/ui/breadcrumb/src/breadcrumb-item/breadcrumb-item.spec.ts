import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { faSolidHouse } from '@ng-icons/font-awesome/solid';
import { render } from '@wismaz/vitest-browser-angular';

import { BreadcrumbItem, type BreadcrumbItemConfig } from './breadcrumb-item';

describe(BreadcrumbItem, () => {
  const breadcrumb = signal<BreadcrumbItemConfig>({
    label: 'Home',
    routerLink: '/',
    icon: faSolidHouse,
  });

  afterEach(() => {
    breadcrumb.set({ label: 'Home', routerLink: '/', icon: faSolidHouse });
  });

  it('show breadcrumb item with icon', async () => {
    const { locator } = await render(BreadcrumbItem, {
      inputs: { breadcrumbConfiguration: breadcrumb },
      providers: [provideRouter([])],
    });

    await expect.element(locator.getByRole('link')).toHaveTextContent('Home');
    await expect.element(locator.getByTestId('breadcrumb-icon')).toBeVisible();
  });

  it('show current page item as text with aria-current', async () => {
    const { locator } = await render(BreadcrumbItem, {
      inputs: { breadcrumbConfiguration: breadcrumb },
      providers: [provideRouter([])],
    });
    breadcrumb.set({ label: 'Current page' });

    await expect.element(locator.getByText('Current page')).toHaveAttribute('aria-current', 'page');
  });
});
