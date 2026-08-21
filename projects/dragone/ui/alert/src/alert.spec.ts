import { signal } from '@angular/core';
import { faSolidCircleCheck, faSolidCircleInfo } from '@ng-icons/font-awesome/solid';
import { render } from '@wismaz/vitest-browser-angular';

import type { StatusType } from '@dragone/ui/utils';

import { Alert } from './alert';

describe(Alert, () => {
  const status = signal<StatusType>('info');
  const ctaText = signal('');
  const titleAsHeading = signal(false);
  const title = signal('Test Alert');
  const ctaClick = vi.fn<() => void>();

  it('must show title', async () => {
    const { locator, componentClassInstance: component } = await render(Alert, {
      inputs: { titleAsHeading, title },
    });
    expect(component.title()).toBe('Test Alert');
    titleAsHeading.set(true);

    await expect.element(locator.getByRole('heading', { name: 'Test Alert' })).toBeVisible();
  });

  it('show default icon for info type', async () => {
    const { locator } = await render(Alert, { inputs: { status, title } });
    const icon = locator.getByTestId('alert-icon');
    await expect.element(icon).toContainHTML(faSolidCircleInfo);
  });

  it('show semantic icon based on alert type', async () => {
    const { locator } = await render(Alert, { inputs: { status, title } });
    const icon = locator.getByTestId('alert-icon');
    status.set('success');

    await expect.element(icon).toContainHTML(faSolidCircleCheck);
  });

  it('must emit ctaClick event on button click', async () => {
    const { locator } = await render(Alert, {
      inputs: { ctaText, title },
      outputs: { ctaClick },
    });
    let btnLocator = locator.getByRole('button', { name: 'Click me' });
    await expect.element(btnLocator).not.toBeInTheDocument();
    ctaText.set('Click me');

    btnLocator = locator.getByRole('button', { name: 'Click me' });
    await expect.element(btnLocator).toBeInTheDocument();

    await btnLocator.click();

    expect(ctaClick).toHaveBeenCalledWith(expect.anything());
  });
});
