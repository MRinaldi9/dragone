import { Component, inputBinding, outputBinding, signal, viewChild } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { form, FormField } from '@angular/forms/signals';
import { NgpSwitch } from 'ng-primitives/switch';
import type { Mock } from 'vitest';
import { page, userEvent, type Locator } from 'vitest/browser';

import { Switch } from './switch';

const setupForm = () => {
  @Component({
    imports: [FormField, Switch],
    template: `<drgn-switch [formField]="field" />`,
  })
  class FormCmp {
    readonly field = form(signal(false));
    readonly stateDir = viewChild.required(NgpSwitch);
  }

  const fixture = TestBed.createComponent(FormCmp);
  const component = fixture.componentInstance;
  const locator = page.elementLocator(fixture.nativeElement);

  return { component, locator, whenStable: (): Promise<void> => fixture.whenStable() };
};

describe(Switch, () => {
  let fixture: ComponentFixture<Switch>;
  let locator: Locator;
  let touchSpy: Mock;
  const readonly = signal(false);
  const hidden = signal(false);
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [Switch],
    });
    touchSpy = vi.fn<() => void>();
    fixture = TestBed.createComponent(Switch, {
      bindings: [
        outputBinding('touch', touchSpy),
        inputBinding('readonly', readonly),
        inputBinding('hidden', hidden),
      ],
    });
    await fixture.whenStable();
    locator = page.elementLocator(fixture.nativeElement);
  });
  afterEach(() => {
    touchSpy.mockReset();
    readonly.set(false);
    hidden.set(false);
  });

  it('should toggle checked state on click', async () => {
    await expect.element(locator).toHaveAttribute('aria-checked', 'false');
    await locator.click();
    await expect.element(locator).toHaveAttribute('aria-checked', 'true');
  });
  it('should emit touch event on blur', async () => {
    await userEvent.tab();
    expect(touchSpy).not.toHaveBeenCalledWith();
    await userEvent.tab();
    expect(touchSpy).toHaveBeenCalledWith(undefined);
  });
  it('should not be interactive when readonly', async () => {
    readonly.set(true);
    await fixture.whenStable();
    await expect.element(locator).toHaveAttribute('readonly');
    await expect.element(locator).toHaveAttribute('aria-checked', 'false');
  });
  it('should be hidden when hidden is true', async () => {
    hidden.set(true);
    await fixture.whenStable();
    await expect.element(locator).toHaveAttribute('hidden');
    await expect.element(locator).not.toBeInViewport();
  });

  describe('form integration', () => {
    it('should update form value on toggle', async () => {
      const { component, locator, whenStable } = setupForm();
      await whenStable();
      const switchLocator = locator.getByRole('switch');
      await expect.element(switchLocator).toHaveAttribute('aria-checked', 'false');
      await switchLocator.click();
      await expect.element(switchLocator).toHaveAttribute('aria-checked', 'true');
      expect(component.field().value).toBeTruthy();
    });
  });
});
