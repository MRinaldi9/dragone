import { Component } from '@angular/core';
import { render } from '@wismaz/vitest-browser-angular';

import { CardLink } from './card-link';

@Component({
  imports: [CardLink],
  template: ` <a drgn-card-link href="/target">Read more</a> `
})
class TestHostCardLink {}

@Component({
  imports: [CardLink],
  template: ` <a drgn-card-link href="/target" target="_blank" rel="author">Read more</a> `
})
class TestHostExplicitRel {}

@Component({
  imports: [CardLink],
  template: ` <a drgn-card-link href="/detail" aria-label="Apri il dettaglio della card"></a> `
})
class TestHostStretchedLink {}

@Component({
  imports: [CardLink],
  template: `
    <h3 id="card-title-id"><a href="/detail">Titolo della card</a></h3>
    <!-- eslint-disable-next-line @angular-eslint/template/elements-content -- stretched link: accessible name via aria-labelledby -->
    <a drgn-card-link href="/detail" aria-labelledby="card-title-id"></a>
  `
})
class TestHostLabelledbyLink {}

describe(CardLink, () => {
  it('must render a native anchor with the given href', async () => {
    const { locator } = await render(TestHostCardLink);
    const link = locator.getByRole('link', { name: 'Read more' });
    await expect.element(link).toBeVisible();
    await expect.element(link).toHaveAttribute('href', '/target');
  });

  it('must default rel to noopener noreferrer when the consumer sets none', async () => {
    const { locator } = await render(TestHostCardLink);
    const link = locator.getByRole('link', { name: 'Read more' });
    await expect.element(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('must leave a consumer-written rel untouched', async () => {
    const { locator } = await render(TestHostExplicitRel);
    const link = locator.getByRole('link', { name: 'Read more' });
    await expect.element(link).toHaveAttribute('target', '_blank');
    await expect.element(link).toHaveAttribute('rel', 'author');
  });

  it('must expose the aria-label as the accessible name when empty', async () => {
    const { locator } = await render(TestHostStretchedLink);
    const link = locator.getByRole('link', { name: 'Apri il dettaglio della card' });
    await expect.element(link).toBeVisible();
    await expect.element(link).toHaveAttribute('href', '/detail');
  });

  it('must support an aria-labelledby reference to the card title', async () => {
    const { locator } = await render(TestHostLabelledbyLink);
    const links = locator.getByRole('link');
    await expect.element(links.nth(1)).toHaveAttribute('aria-labelledby', 'card-title-id');
    await expect.element(links.nth(1)).toHaveAttribute('href', '/detail');
  });
});
