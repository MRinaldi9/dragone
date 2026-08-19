import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { render } from '@wismaz/vitest-browser-angular';

import { Breadcrumb } from './breadcrumb';
import type { BreadcrumbItemConfig } from './breadcrumb-item/breadcrumb-item';

describe(Breadcrumb, () => {
  const breadcrumbs = signal<BreadcrumbItemConfig[]>([]);

  const trail: BreadcrumbItemConfig[] = [
    { label: 'home', routerLink: '/' },
    { label: 'category', routerLink: '/category' },
    { label: 'subcategory', routerLink: '/category/subcategory' },
    { label: 'products', routerLink: '/category/subcategory/products' },
    { label: 'items', routerLink: '/category/subcategory/products/items' },
    { label: 'item1', routerLink: '/category/subcategory/products/items/item1' },
    { label: 'details' },
  ];

  afterEach(() => {
    breadcrumbs.set([]);
  });

  it('should render nothing when breadcrumbs is empty', async () => {
    const { locator } = await render(Breadcrumb, {
      inputs: { breadcrumbs },
      providers: [provideRouter([])],
    });

    await expect.element(locator.getByRole('listitem')).not.toBeInTheDocument();
  });

  it('should render ancestors as links and the current page as text', async () => {
    const { locator } = await render(Breadcrumb, {
      inputs: { breadcrumbs },
      providers: [provideRouter([])],
    });
    breadcrumbs.set([
      { label: 'home', routerLink: '/' },
      { label: 'products', routerLink: '/products' },
      { label: 'item' },
    ]);

    const links = locator.getByRole('link');
    await expect.poll(() => links.elements().length).toBe(2);
    await expect.element(links.nth(0)).toHaveTextContent('home');
    await expect.element(links.nth(1)).toHaveTextContent('products');

    await expect.element(locator.getByText('item')).toHaveAttribute('aria-current', 'page');
  });

  it('should collapse to first, ellipsis and last item when more than 6 items', async () => {
    const { locator } = await render(Breadcrumb, {
      inputs: { breadcrumbs },
      providers: [provideRouter([])],
    });
    breadcrumbs.set(trail);

    const listitems = locator.getByRole('listitem');
    await expect.poll(() => listitems.elements().length).toBe(3);
    await expect.element(listitems.nth(0)).toHaveTextContent('home');
    await expect.element(listitems.nth(2)).toHaveTextContent('details');

    await expect.element(locator.getByRole('button')).toBeInTheDocument();
  });

  it('should expand breadcrumbs when ellipsis is clicked', async () => {
    const { locator } = await render(Breadcrumb, {
      inputs: { breadcrumbs },
      providers: [provideRouter([])],
    });
    breadcrumbs.set(trail);

    await locator.getByRole('button').click();

    const listitems = locator.getByRole('listitem');
    await expect.poll(() => listitems.elements().length).toBe(7);
    await expect.element(locator.getByText('details')).toHaveAttribute('aria-current', 'page');
    await expect.element(locator).toHaveClass('expanded');
  });
});
