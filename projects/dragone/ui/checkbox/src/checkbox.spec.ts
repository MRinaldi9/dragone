import { Component, inputBinding, signal, twoWayBinding, viewChild } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { form, FormField } from '@angular/forms/signals';
import { NgpCheckbox } from 'ng-primitives/checkbox';
import { type Locator, page } from 'vitest/browser';

import { Checkbox } from './checkbox';

const setupForm = () => {
  @Component({
    imports: [FormField, Checkbox],
    template: `<drgn-checkbox [formField]="field" />`,
  })
  class FormCmp {
    readonly field = form(signal(false));
    readonly stateDir = viewChild.required(NgpCheckbox);
  }

  const fixture = TestBed.createComponent(FormCmp);
  const component = fixture.componentInstance;
  const locator = page.elementLocator(fixture.nativeElement);

  return { component, locator, whenStable: (): Promise<void> => fixture.whenStable() };
};

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
    expect(component['_checked']()).toBeFalsy();
  });

  it('should set disabled the component', { tags: ['component'] }, async () => {
    disabled.set(true);
    await fixture.whenStable();

    await expect.element(locator).toHaveAttribute('data-disabled');
  });

  it('should set disabled state', { tags: ['unit'] }, async () => {
    disabled.set(true);
    await fixture.whenStable();

    await expect.element(locator).toHaveAttribute('data-disabled');
  });

  it('should change checked status if clicked', { tags: ['component'] }, async () => {
    expect(component['_checked']()).toBeFalsy();
    await locator.click();
    expect(component['_checked']()).toBeTruthy();
    await expect.element(locator).toHaveAttribute('aria-checked', 'true');
  });

  describe('forms integration', () => {
    it('start form integration', async () => {
      const { component, whenStable } = setupForm();
      await whenStable();

      expect(component.stateDir().checked()).toBeFalsy();
      expect(component.field().value()).toBeFalsy();
    });
    it('should update form value on click', async () => {
      const { component, locator, whenStable } = setupForm();
      await whenStable();

      await locator.getByRole('checkbox').click();
      expect(component.stateDir().checked()).toBeTruthy();
      expect(component.field().value()).toBeTruthy();
    });
  });
});
