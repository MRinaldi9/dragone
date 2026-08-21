import { signal } from '@angular/core';
import { render } from '@wismaz/vitest-browser-angular';

import type { StatusType } from '@dragone/ui/utils';

import { Tag } from './tag';

describe(Tag, () => {
  const status = signal<StatusType>('neutral');
  const ariaLabel = signal<string | undefined>(undefined);

  afterEach(() => {
    status.set('neutral');
    ariaLabel.set(undefined);
  });

  it('should have role status', async () => {
    const { locator } = await render(Tag);
    await expect.element(locator).toHaveAttribute('role', 'status');
  });

  it('should have default aria-label as null', async () => {
    const { locator } = await render(Tag);
    await expect.element(locator).not.toHaveAttribute('aria-label');
  });

  it('should have neutral status by default', async () => {
    const { locator } = await render(Tag);

    await expect.element(locator).not.toHaveAttribute('data-status', 'neutral');
  });

  it('should update status attribute when statusTag input changes', async () => {
    const { locator } = await render(Tag, {
      inputs: { status },
    });
    await expect.element(locator).not.toHaveAttribute('data-status');
    status.set('success');

    await expect.element(locator).toHaveAttribute('data-status', 'success');
  });

  it('should update aria-label attribute when ariaLabel input changes', async () => {
    const { locator } = await render(Tag, {
      inputs: { ariaLabel },
    });
    await expect.element(locator).not.toHaveAttribute('aria-label');
    ariaLabel.set('New Aria Label');

    await expect.element(locator).toHaveAttribute('aria-label', 'New Aria Label');
  });
});
