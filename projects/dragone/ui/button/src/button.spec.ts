import { Component, input, inputBinding, signal, viewChild } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { noop } from 'rxjs';
import { page, type Locator } from 'vitest/browser';

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
      (click)="onClick()"
    >
      Dragone
    </button>
  `,
})
class TestHostComponent {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('large');
  isIconOnly = input(false);
  isDisabled = input(false);
  onClick = input(noop);

  btnComp = viewChild.required(Button);
}

describe(Button, () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let locator: Locator;
  const size = signal<ButtonSize>('large');
  const isIconOnly = signal<boolean>(false);
  const variant = signal<ButtonVariant>('primary');
  const isDisabled = signal<boolean>(false);
  const clickSpy = vi.fn<() => void>();

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });

    fixture = TestBed.createComponent(TestHostComponent, {
      bindings: [
        inputBinding('size', size),
        inputBinding('isIconOnly', isIconOnly),
        inputBinding('variant', variant),
        inputBinding('isDisabled', isDisabled),
        inputBinding('onClick', clickSpy),
      ],
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
    locator = page.elementLocator(fixture.nativeElement);
  });

  afterEach(() => {
    size.set('large');
    isIconOnly.set(false);
    variant.set('primary');
    isDisabled.set(false);
  });

  it('should create and default property', () => {
    expect(component.btnComp()).toBeTruthy();
    expect(component.btnComp().size()).toBe('large');
    expect(component.btnComp().isIconOnly()).toBeFalsy();
    expect(component.btnComp().variant()).toBe('primary');
  });

  it('should change size', async () => {
    size.set('medium');
    await fixture.whenStable();

    const btnHtml = page.getByRole('button');
    await expect.element(btnHtml).toHaveAttribute('data-size', 'medium');
  });
  it('should change isIconOnly', async () => {
    isIconOnly.set(true);
    await fixture.whenStable();
    expect(component.isIconOnly()).toBeTruthy();
  });
  it('should change variant', async () => {
    variant.set('danger');
    await fixture.whenStable();
    expect(component.variant()).toBe('danger');
  });
  it('should change disabled', async () => {
    isDisabled.set(true);
    await fixture.whenStable();
    const btnHtml = page.getByRole('button');
    await expect.element(btnHtml).toBeDisabled();
    await expect.element(btnHtml).toHaveAttribute('data-disabled');
  });

  it('should emit native event', async () => {
    await locator.getByRole('button').click();
    expect(clickSpy).toHaveBeenCalledWith();
  });
});
