import { signal } from '@angular/core';
import { renderDirective } from '@wismaz/vitest-browser-angular';

import { Busy } from './busy';

describe(Busy, () => {
  const busy = signal(false);

  afterEach(() => {
    busy.set(false);
  });

  const renderBusy = () =>
    renderDirective(Busy, {
      template: ` <div data-testid="region" [drgnBusy]="busy()"></div> `,
      hostProps: { busy }
    });

  it('should leave the region interactive by default', async () => {
    const { getByTestId } = await renderBusy();
    const region = getByTestId('region');

    await expect.element(region).toHaveAttribute('aria-busy', 'false');
    expect(region.element().hasAttribute('inert')).toBeFalsy();
  });

  it('should block the region while busy', async () => {
    const { getByTestId } = await renderBusy();
    busy.set(true);

    const region = getByTestId('region');
    await expect.element(region).toHaveAttribute('aria-busy', 'true');
    expect(region.element().hasAttribute('inert')).toBeTruthy();
  });

  it('should unblock the region when busy resolves', async () => {
    const { getByTestId } = await renderBusy();
    busy.set(true);
    busy.set(false);

    const region = getByTestId('region');
    await expect.element(region).toHaveAttribute('aria-busy', 'false');
    expect(region.element().hasAttribute('inert')).toBeFalsy();
  });

  it('should treat a bare attribute as busy', async () => {
    const { getByTestId } = await renderDirective(Busy, {
      template: ` <div data-testid="bare" drgnBusy></div> `
    });
    const bare = getByTestId('bare');

    await expect.element(bare).toHaveAttribute('aria-busy', 'true');
    expect(bare.element().hasAttribute('inert')).toBeTruthy();
  });
});
