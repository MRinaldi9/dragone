import { inputBinding, signal, twoWayBinding } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { type Locator, page } from 'vitest/browser';

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
    expect(component.checked()).toBeFalsy();
  });

  it('should set disabled the component', { tags: ['component'] }, async () => {
    disabled.set(true);
    await fixture.whenStable();

    await expect.element(locator).toHaveAttribute('data-disabled');
  });

  it('should set disabled state', { tags: ['unit'] }, async () => {
    disabled.set(true);
    await fixture.whenStable();

    expect(component.disabled()).toBeTruthy();
  });

  it('should change checked status if clicked', { tags: ['component'] }, async () => {
    expect(component.checked()).toBeFalsy();
    await locator.click();
    expect(component.checked()).toBeTruthy();
    await expect.element(locator).toHaveAttribute('aria-checked', 'true');
  });

  // It('should have touchedFn called on blur', () => {
  //   Const touchedFnSpy = vi.fn();
  //   Component.registerOnTouched(touchedFnSpy);

  //   Fixture.debugElement.triggerEventHandler('blur', {});
  //   Expect(touchedFnSpy).toHaveBeenCalled();
  // });
});
