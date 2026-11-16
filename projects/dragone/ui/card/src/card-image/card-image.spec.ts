import { Component, input, signal } from '@angular/core';
import { render } from '@wismaz/vitest-browser-angular';

import { Card, type CardType } from '../card';
import { CardImage, type CardImagePosition } from './card-image';

@Component({
  imports: [Card, CardImage],
  template: `
    <drgn-card [type]="type()">
      <drgn-card-image
        data-testid="image"
        src="https://example.com/image.png"
        alt="A descriptive image"
        [position]="position()"
      />
    </drgn-card>
  `
})
class TestHostCardImage {
  type = input<CardType>('portrait');
  position = input<CardImagePosition | undefined>();
}

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
      inputs: { src, alt, position: signal('left') }
    });
    await expect.element(locator).toHaveAttribute('data-position', 'left');
  });

  it('must default to top outside a landscape card', async () => {
    const { locator } = await render(CardImage, { inputs: { src, alt } });
    await expect.element(locator).toHaveAttribute('data-position', 'top');
  });

  it('must default to left inside a landscape card', async () => {
    const { locator } = await render(TestHostCardImage, {
      inputs: { type: signal('landscape') }
    });
    await expect.element(locator.getByTestId('image')).toHaveAttribute('data-position', 'left');
  });

  it('must let an explicit position win over the card type', async () => {
    const { locator } = await render(TestHostCardImage, {
      inputs: { type: signal('landscape'), position: signal('right') }
    });
    await expect.element(locator.getByTestId('image')).toHaveAttribute('data-position', 'right');
  });
});
