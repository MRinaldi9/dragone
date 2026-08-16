import { Component, input, output, signal } from '@angular/core';
import { render } from '@wismaz/vitest-browser-angular';

import { Button, type ButtonSize, type ButtonVariant } from './button';

@Component({
  imports: [Button],
  template: `
    <button
      drgnButton
      [variant]="variant()"
      [size]="size()"
      [icon]="isIconOnly()"
      [disabled]="isDisabled()"
      (click)="clickCta.emit()"
    >
      Dragone
    </button>
  `,
})
class TestHostComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('large');
  readonly isIconOnly = input(false);
  readonly isDisabled = input(false);
  readonly clickCta = output<void>();
}

describe(Button, () => {
  const size = signal<ButtonSize>('large');
  const isIconOnly = signal<boolean>(false);
  const variant = signal<ButtonVariant>('primary');
  const isDisabled = signal<boolean>(false);
  const clickSpy = vi.fn<() => void>();

  afterEach(() => {
    size.set('large');
    isIconOnly.set(false);
    variant.set('primary');
    isDisabled.set(false);
  });

  it('should create with default properties', async () => {
    const { locator } = await render(TestHostComponent, {
      inputs: { size, isIconOnly, variant, isDisabled },
    });
    const button = locator.getByRole('button');
    await expect.element(button).toBeTruthy();
    await expect.element(button).toHaveAttribute('data-size', 'large');
    await expect.element(button).not.toHaveAttribute('data-icon-only');
    await expect.element(button).toHaveAttribute('data-variant', 'primary');
  });

  it('should change size', async () => {
    const { locator } = await render(TestHostComponent, {
      inputs: { size },
    });
    size.set('medium');

    await expect.element(locator.getByRole('button')).toHaveAttribute('data-size', 'medium');
  });

  it('should change isIconOnly', async () => {
    const { locator } = await render(TestHostComponent, {
      inputs: { isIconOnly },
    });
    isIconOnly.set(true);

    await expect.element(locator.getByRole('button')).toHaveAttribute('data-icon-only');
  });

  it('should change variant', async () => {
    const { locator } = await render(TestHostComponent, {
      inputs: { size, isIconOnly, variant, isDisabled },
    });
    variant.set('danger');

    await expect.element(locator.getByRole('button')).toHaveAttribute('data-variant', 'danger');
  });

  it('should disable the button', async () => {
    const { locator } = await render(TestHostComponent, {
      inputs: { size, isIconOnly, variant, isDisabled },
    });
    isDisabled.set(true);
    const btnLocator = locator.getByRole('button');

    await expect.element(btnLocator).toBeDisabled();
    await expect.element(btnLocator).toHaveAttribute('data-disabled');
  });

  it('should emit native click event', async () => {
    const { locator } = await render(TestHostComponent, {
      inputs: { size, isIconOnly, variant, isDisabled },
      outputs: { clickCta: clickSpy },
    });
    await locator.getByRole('button').click();

    expect(clickSpy).toHaveBeenCalledOnce();
  });
});
