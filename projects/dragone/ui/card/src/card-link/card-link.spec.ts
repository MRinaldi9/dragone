import { Component, input, signal } from '@angular/core';
import { render } from '@wismaz/vitest-browser-angular';

import { CardLink } from './card-link';

@Component({
  imports: [CardLink],
  template: ` <drgn-card-link [href]="href()" [target]="target()">Read more</drgn-card-link> `,
})
class TestHostCardLink {
  href = input('/target');
  target = input('_self');
}

describe(CardLink, () => {
  const href = signal('/target');
  const target = signal('_self');

  afterEach(() => {
    href.set('/target');
    target.set('_self');
  });

  it('must render an anchor with the given href', async () => {
    const { locator } = await render(TestHostCardLink);
    const link = locator.getByRole('link', { name: 'Read more' });
    await expect.element(link).toBeVisible();
    await expect.element(link).toHaveAttribute('href', '/target');
  });

  it('must apply the target attribute when set', async () => {
    const { locator } = await render(TestHostCardLink, { inputs: { target } });
    target.set('_blank');
    const link = locator.getByRole('link', { name: 'Read more' });
    await expect.element(link).toHaveAttribute('target', '_blank');
  });
});
