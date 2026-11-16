import { signal } from '@angular/core';
import { render } from '@wismaz/vitest-browser-angular';

import { LoaderOverlay } from './loader-overlay';

describe(LoaderOverlay, () => {
  const label = signal('Caricamento in corso');

  afterEach(() => {
    label.set('Caricamento in corso');
    document.body.style.overflow = '';
  });

  it('must render the spinner with the forwarded label', async () => {
    const { locator } = await render(LoaderOverlay, { inputs: { label } });

    await expect
      .element(locator.getByRole('status', { name: 'Caricamento in corso' }))
      .toBeVisible();
  });

  it('must fall back to the default name when the forwarded label is empty', async () => {
    const { locator } = await render(LoaderOverlay, { inputs: { label } });
    label.set('');

    await expect
      .element(locator.getByRole('status', { name: 'Caricamento in corso' }))
      .toBeVisible();
  });

  it('must lock the page scroll while mounted and restore it on destroy', async () => {
    const { fixture, locator } = await render(LoaderOverlay, { inputs: { label } });

    await expect.element(locator.getByRole('status')).toBeVisible();
    expect(document.body.style.overflow).toBe('hidden');

    fixture.destroy();

    expect(document.body.style.overflow).toBe('');
  });
});
