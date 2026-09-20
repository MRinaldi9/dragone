import { signal } from '@angular/core';
import { render } from '@wismaz/vitest-browser-angular';

import { CardImage } from './card-image';

describe(CardImage, () => {
  const src = signal('https://example.com/image.png');
  const alt = signal('A descriptive image');

  it('must render the image with src and alt', async () => {
    const { locator } = await render(CardImage, { inputs: { src, alt } });
    const img = locator.getByRole('img', { name: 'A descriptive image' });
    await expect.element(img).toBeVisible();
    await expect.element(img).toHaveAttribute('src', 'https://example.com/image.png');
  });

  it('must reflect the position on the host', async () => {
    const { locator } = await render(CardImage, {
      inputs: { src, alt, position: signal('left') },
    });
    await expect.element(locator).toHaveAttribute('data-position', 'left');
  });
});
