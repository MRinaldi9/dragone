import { render } from '@wismaz/vitest-browser-angular';

import { BreadcrumbEllipsis } from './breadcrumb-ellipsis';

describe(BreadcrumbEllipsis, () => {
  it('should create', async () => {
    const { componentClassInstance: component } = await render(BreadcrumbEllipsis);
    expect(component).toBeTruthy();
  });
});
