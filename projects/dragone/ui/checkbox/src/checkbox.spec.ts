import { inputBinding, signal, twoWayBinding } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { Locator, page } from 'vitest/browser';

import { Checkbox } from './checkbox';

describe(Checkbox, () => {
  let component: Checkbox;
  let fixture: ComponentFixture<Checkbox>;
  let locator: Locator;
  const checked = signal(false);
  const disabled = signal(false);

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [Checkbox],
    });

    fixture = TestBed.createComponent(Checkbox, {
      bindings: [twoWayBinding('checked', checked), inputBinding('disabled', disabled)],
      inferTagName: true,
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
    locator = page.elementLocator(fixture.nativeElement);
  });

  afterEach(() => {
    checked.set(false);
    disabled.set(false);
  });

  it('should not have been checked initially visually', { tags: ['component'] }, async () => {
    await expect.element(locator).toHaveAttribute('aria-checked', 'false');
  });

  it('should have checked state to false', { tags: ['unit'] }, () => {
    expect(component.checked()).toBe(false);
  });

  it('should set disabled the component', { tags: ['component'] }, async () => {
    disabled.set(true);
    await fixture.whenStable();

    await expect.element(locator).toHaveAttribute('data-disabled');
  });

  it('should set disabled state', { tags: ['unit'] }, async () => {
    disabled.set(true);
    await fixture.whenStable();

    expect(component.disabled()).toBe(true);
  });

  it('should change checked status if clicked', { tags: ['component'] }, async () => {
    expect(component.checked()).toBe(false);
    await locator.click();
    expect(component.checked()).toBe(true);
    await expect.element(locator).toHaveAttribute('aria-checked', 'true');
  });

  // it('should have touchedFn called on blur', () => {
  //   const touchedFnSpy = vi.fn();
  //   component.registerOnTouched(touchedFnSpy);

  //   fixture.debugElement.triggerEventHandler('blur', {});
  //   expect(touchedFnSpy).toHaveBeenCalled();
  // });
});
