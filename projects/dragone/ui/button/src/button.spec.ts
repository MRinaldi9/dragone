import { Component, input, output, signal } from '@angular/core';
import { render } from '@wismaz/vitest-browser-angular';

import { Button, type ButtonSize, type ButtonSemantic } from './button';

@Component({
  imports: [Button],
  template: `
    <button
      drgnButton
      [semantic]="semantic()"
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
  readonly semantic = input<ButtonSemantic>('primary');
  readonly size = input<ButtonSize>('large');
  readonly isIconOnly = input(false);
  readonly isDisabled = input(false);
  readonly clickCta = output<void>();
}

@Component({
  imports: [Button],
  template: `
    <button drgnButton>
      <span slot="leading" class="test-icon">*</span>
      Dragone
      <span slot="trailing" class="test-icon">*</span>
    </button>
  `,
})
class TestHostWithIcons {}

@Component({
  imports: [Button],
  template: ` <button drgnButton labelClass="drgn-label-md-600">Dragone</button> `,
})
class TestHostCustomLabel {}

describe(Button, () => {
  const size = signal<ButtonSize>('large');
  const isIconOnly = signal<boolean>(false);
  const semantic = signal<ButtonSemantic>('primary');
  const isDisabled = signal<boolean>(false);
  const clickSpy = vi.fn<() => void>();

  afterEach(() => {
    size.set('large');
    isIconOnly.set(false);
    semantic.set('primary');
    isDisabled.set(false);
  });

  it('should create with default properties', async () => {
    const { locator } = await render(TestHostComponent, {
      inputs: { size, isIconOnly, semantic, isDisabled },
    });
    const button = locator.getByRole('button');
    await expect.element(button).toBeTruthy();
    await expect.element(button).toHaveAttribute('data-size', 'large');
    await expect.element(button).not.toHaveAttribute('data-icon-only');
    await expect.element(button).toHaveAttribute('data-semantic', 'primary');
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

  it.skip('should change variant', async () => {
    const { locator } = await render(TestHostComponent, {
      inputs: { size, isIconOnly, semantic, isDisabled },
    });
    semantic.set('danger');

    await expect.element(locator.getByRole('button')).toHaveAttribute('data-semantic', 'danger');
  });

  it('should disable the button', async () => {
    const { locator } = await render(TestHostComponent, {
      inputs: { size, isIconOnly, semantic, isDisabled },
    });
    isDisabled.set(true);
    const btnLocator = locator.getByRole('button');

    await expect.element(btnLocator).toBeDisabled();
    await expect.element(btnLocator).toHaveAttribute('data-disabled');
  });

  it('should emit native click event', async () => {
    const { locator } = await render(TestHostComponent, {
      inputs: { size, isIconOnly, semantic, isDisabled },
      outputs: { clickCta: clickSpy },
    });
    await locator.getByRole('button').click();

    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it('should apply the label class only to the text, not to slot icons', async () => {
    const { locator } = await render(TestHostWithIcons);
    const button = locator.getByRole('button');

    // The text is wrapped in a span carrying the typography class
    const label = button.locator('span.drgn-label-md-700');
    await expect.element(label).toHaveTextContent('Dragone');

    // Slot icons are not wrapped and do not carry the typography class
    const leadingIcon = button.locator('[slot="leading"]');
    const trailingIcon = button.locator('[slot="trailing"]');
    await expect.element(leadingIcon).not.toHaveClass('drgn-label-md-700');
    await expect.element(trailingIcon).not.toHaveClass('drgn-label-md-700');
  });

  it('should allow overriding the label typography class', async () => {
    const { locator } = await render(TestHostCustomLabel);

    const label = locator.getByRole('button').locator('span.drgn-label-md-600');
    await expect.element(label).toHaveTextContent('Dragone');
  });
});
