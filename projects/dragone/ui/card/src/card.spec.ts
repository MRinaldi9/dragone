import { Component, input, signal } from '@angular/core';
import { render } from '@wismaz/vitest-browser-angular';

import type { LayoutType } from '@dragone/ui/utils';

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
    <drgn-card data-testid="card" [type]="type()" [layout]="layout()" [theme]="theme()">
      <drgn-card-body data-testid="body">
        <drgn-card-header data-testid="header">
          <drgn-card-tag slot="leading">Categoria</drgn-card-tag>
          <span slot="trailing">13 Nov 2021</span>
        </drgn-card-header>
        <p drgn-card-title>Title</p>
        <drgn-card-text>Card body content</drgn-card-text>
      </drgn-card-body>
      <drgn-card-footer data-testid="footer">
        <button>Action</button>
      </drgn-card-footer>
    </drgn-card>
  `
})
class TestHostCard {
  type = input<CardType>('portrait');
  layout = input<LayoutType>('desktop');
  theme = input<'light' | 'dark'>('light');
}

describe(Card, () => {
  const type = signal<CardType>('portrait');
  const layout = signal<LayoutType>('desktop');
  const theme = signal<'light' | 'dark'>('light');

  afterEach(() => {
    type.set('portrait');
    layout.set('desktop');
    theme.set('light');
  });

  it('must render with default portrait type and desktop layout', async () => {
    const { locator } = await render(TestHostCard);
    const card = locator.getByTestId('card');
    await expect.element(card).toHaveAttribute('data-type', 'portrait');
    await expect.element(card).toHaveAttribute('data-layout', 'desktop');
  });

  it('must reflect the type on the host', async () => {
    const { locator } = await render(TestHostCard, { inputs: { type } });
    const card = locator.getByTestId('card');
    type.set('landscape');
    await expect.element(card).toHaveAttribute('data-type', 'landscape');
  });

  it('must reflect the layout on the host', async () => {
    const { locator } = await render(TestHostCard, { inputs: { layout } });
    const card = locator.getByTestId('card');
    layout.set('mobile');
    await expect.element(card).toHaveAttribute('data-layout', 'mobile');
  });

  it('must propagate type and layout to body, header and footer', async () => {
    const { locator } = await render(TestHostCard, { inputs: { type, layout } });
    type.set('process');
    layout.set('mobile');
    const body = locator.getByTestId('body');
    const header = locator.getByTestId('header');
    const footer = locator.getByTestId('footer');
    await expect.element(body).toHaveAttribute('data-type', 'process');
    await expect.element(body).toHaveAttribute('data-layout', 'mobile');
    await expect.element(header).toHaveAttribute('data-type', 'process');
    await expect.element(header).toHaveAttribute('data-layout', 'mobile');
    await expect.element(footer).toHaveAttribute('data-type', 'process');
    await expect.element(footer).toHaveAttribute('data-layout', 'mobile');
  });

  it('must apply dark theme via data-theme', async () => {
    const { locator } = await render(TestHostCard, { inputs: { theme } });
    const card = locator.getByTestId('card');
    theme.set('dark');
    await expect.element(card).toHaveAttribute('data-theme', 'dark');
  });

  it('must project content', async () => {
    const { locator } = await render(TestHostCard);
    await expect.element(locator.getByText('Categoria')).toBeVisible();
    await expect.element(locator.getByText('13 Nov 2021')).toBeVisible();
    await expect.element(locator.getByText('Title')).toBeVisible();
    await expect.element(locator.getByText('Card body content')).toBeVisible();
    await expect.element(locator.getByRole('button', { name: 'Action' })).toBeVisible();
  });
});
