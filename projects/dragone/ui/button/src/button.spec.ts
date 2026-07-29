import { Component, input, signal, viewChild } from '@angular/core';
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
      (click)="clickSpy()"
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
  readonly clickSpy = vi.fn<() => void>();
  readonly btnComp = viewChild.required(Button);
}

describe(Button, () => {
  const size = signal<ButtonSize>('large');
  const isIconOnly = signal<boolean>(false);
  const variant = signal<ButtonVariant>('primary');
  const isDisabled = signal<boolean>(false);

  afterEach(() => {
    size.set('large');
    isIconOnly.set(false);
    variant.set('primary');
    isDisabled.set(false);
  });

  it('should create with default properties', async () => {
    const { componentClassInstance: component } = await render(TestHostComponent, {
      inputs: { size, isIconOnly, variant, isDisabled },
    });
    expect(component.btnComp()).toBeTruthy();
    expect(component.btnComp().size()).toBe('large');
    expect(component.btnComp().isIconOnly()).toBeFalsy();
    expect(component.btnComp().variant()).toBe('primary');
  });

  it('should change size', async () => {
    const { fixture, getByRole } = await render(TestHostComponent, {
      inputs: { size, isIconOnly, variant, isDisabled },
    });
    size.set('medium');
    await fixture.whenStable();

    await expect.element(getByRole('button')).toHaveAttribute('data-size', 'medium');
  });

  it('should change isIconOnly', async () => {
    const {
      fixture,
      componentClassInstance: component,
      getByRole,
    } = await render(TestHostComponent, {
      inputs: { size, isIconOnly, variant, isDisabled },
    });
    isIconOnly.set(true);
    await fixture.whenStable();

    expect(component.isIconOnly()).toBeTruthy();
    await expect.element(getByRole('button')).toHaveAttribute('data-icon-only', 'true');
  });

  it('should change variant', async () => {
    const {
      fixture,
      componentClassInstance: component,
      getByRole,
    } = await render(TestHostComponent, {
      inputs: { size, isIconOnly, variant, isDisabled },
    });
    variant.set('danger');
    await fixture.whenStable();

    expect(component.variant()).toBe('danger');
    await expect.element(getByRole('button')).toHaveAttribute('data-variant', 'danger');
  });

  it('should disable the button', async () => {
    const { fixture, getByRole } = await render(TestHostComponent, {
      inputs: { size, isIconOnly, variant, isDisabled },
    });
    isDisabled.set(true);
    await fixture.whenStable();

    await expect.element(getByRole('button')).toBeDisabled();
    await expect.element(getByRole('button')).toHaveAttribute('data-disabled');
  });

  it('should emit native click event', async () => {
    const { componentClassInstance: component, getByRole } = await render(TestHostComponent, {
      inputs: { size, isIconOnly, variant, isDisabled },
    });
    await getByRole('button').click();

    expect(component.clickSpy).toHaveBeenCalledWith();
  });
});
