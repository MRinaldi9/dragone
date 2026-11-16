import { render } from '@wismaz/vitest-browser-angular';

import { BreadcrumbSeparator } from './breadcrumb-separator';

describe(BreadcrumbSeparator, () => {
  it('should be hidden from the accessibility tree', async () => {
    const { locator } = await render(BreadcrumbSeparator);

    await expect.element(locator).toHaveAttribute('role', 'presentation');
    await expect.element(locator).toHaveAttribute('aria-hidden', 'true');
  });
});
