import { Component, input, signal } from '@angular/core';
import { render } from '@wismaz/vitest-browser-angular';

import { CardTitle, type AriaLevel } from './card-title';

@Component({
  imports: [CardTitle],
  template: `
    <p drgn-card-title [asHeading]="asHeading()" [headingLevel]="headingLevel()">Title</p>
  `,
})
class TestHostCardTitle {
  asHeading = input(false);
  headingLevel = input<AriaLevel>(3);
}

@Component({
  imports: [CardTitle],
  template: ` <a drgn-card-title href="/target">Title</a> `,
})
class TestHostCardTitleLink {}

describe(CardTitle, () => {
  const asHeading = signal(false);
  const headingLevel = signal<AriaLevel>(3);

  afterEach(() => {
    asHeading.set(false);
    headingLevel.set(3);
  });

  it('must render as plain text by default', async () => {
    const { locator } = await render(TestHostCardTitle);
    await expect.element(locator).toHaveTextContent('Title');
    await expect.element(locator.getByRole('heading')).not.toBeInTheDocument();
  });

  it('must expose the title as a heading when asHeading is true', async () => {
    const { locator } = await render(TestHostCardTitle, { inputs: { asHeading } });
    asHeading.set(true);
    await expect.element(locator.getByRole('heading', { name: 'Title' })).toBeVisible();
    await expect.element(locator.getByRole('heading')).toHaveAttribute('aria-level', '3');
  });

  it('must render as a link when applied to an anchor', async () => {
    const { locator } = await render(TestHostCardTitleLink);
    const link = locator.getByRole('link', { name: 'Title' });
    await expect.element(link).toBeVisible();
    await expect.element(link).toHaveAttribute('href', '/target');
  });
});
