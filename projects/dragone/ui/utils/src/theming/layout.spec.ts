import { Component, input, signal } from '@angular/core';
import { render } from '@wismaz/vitest-browser-angular';

import { Layout, type LayoutType } from './layout';

@Component({
  imports: [Layout],
  template: ` <div data-testid="layout" [drgnLayout]="layout()"></div> `,
})
class TestHostComponent {
  layout = input<LayoutType>('desktop');
}

describe(Layout, () => {
  const layout = signal<LayoutType>('desktop');

  it('should have default layout to desktop', async () => {
    const { locator } = await render(TestHostComponent);
    await expect.element(locator.getByTestId('layout')).toHaveAttribute('data-layout', 'desktop');
  });

  it('should change layout from desktop to mobile', async () => {
    const { locator } = await render(TestHostComponent, { inputs: { layout } });
    await expect.element(locator.getByTestId('layout')).toHaveAttribute('data-layout', 'desktop');
    layout.set('mobile');
    await expect.element(locator.getByTestId('layout')).toHaveAttribute('data-layout', 'mobile');
  });
});
