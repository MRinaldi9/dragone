import { Component, input, signal } from '@angular/core';
import { render } from '@wismaz/vitest-browser-angular';

import { Card, type CardType } from './card';
import { CardBody } from './card-body/card-body';
import { CardFooter } from './card-footer/card-footer';
import { CardHeader } from './card-header/card-header';
import { CardTag } from './card-tag/card-tag';
import { CardText } from './card-text/card-text';
import { CardTitle } from './card-title/card-title';

@Component({
  imports: [Card, CardBody, CardHeader, CardFooter, CardTag, CardText, CardTitle],
  template: `
    <drgn-card [type]="type()" [theme]="theme()">
      <drgn-card-body>
        <drgn-card-header [type]="type()">
          <drgn-card-tag slot="leading">Categoria</drgn-card-tag>
        </drgn-card-header>
        <p drgn-card-title>Title</p>
        <drgn-card-text>Card body content</drgn-card-text>
      </drgn-card-body>
      <drgn-card-footer [type]="type()">
        <button>Action</button>
      </drgn-card-footer>
    </drgn-card>
  `,
})
class TestHostCard {
  type = input<CardType>('portrait');
  theme = input<'light' | 'dark'>('light');
}

describe(Card, () => {
  const type = signal<CardType>('portrait');
  const theme = signal<'light' | 'dark'>('light');

  afterEach(() => {
    type.set('portrait');
    theme.set('light');
  });

  it('must render with default portrait type', async () => {
    const { locator } = await render(TestHostCard);
    const card = locator.locator('drgn-card');
    await expect.element(card).toHaveAttribute('data-type', 'portrait');
  });

  it('must reflect the type on the host', async () => {
    const { locator } = await render(TestHostCard, { inputs: { type } });
    const card = locator.locator('drgn-card');
    type.set('landscape');
    await expect.element(card).toHaveAttribute('data-type', 'landscape');
  });

  it('must apply dark theme via data-theme', async () => {
    const { locator } = await render(TestHostCard, { inputs: { theme } });
    const card = locator.locator('drgn-card');
    theme.set('dark');
    await expect.element(card).toHaveAttribute('data-theme', 'dark');
  });

  it('must project content', async () => {
    const { locator } = await render(TestHostCard);
    const card = locator.locator('drgn-card');
    await expect.element(card).toHaveTextContent('Card body content');
    await expect.element(card).toHaveTextContent('Title');
  });
});
