/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, signal, viewChild } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { render } from '@wismaz/vitest-browser-angular';
import { NgpCheckbox } from 'ng-primitives/checkbox';

import { Checkbox } from './checkbox';

const setupForm = async () => {
  @Component({
    imports: [FormField, Checkbox],
    template: `<drgn-checkbox [formField]="field" />`,
  })
  class FormCmp {
    readonly field = form(signal(false));
    readonly stateDir = viewChild.required(NgpCheckbox);
  }

  return await render(FormCmp);
};

describe(Checkbox, () => {
  const checked = signal(false);
  const disabled = signal(false);

  afterEach(() => {
    checked.set(false);
    disabled.set(false);
  });

  it('should not have been checked initially visually', async () => {
    const { locator, componentClassInstance: component } = await render(Checkbox, {
      inputs: { checked } as any,
    });
    await expect.element(locator).toHaveAttribute('aria-checked', 'false');
    expect(component['checkedValue']()).toBeFalsy();
  });

  it('should set disabled', async () => {
    const { locator } = await render(Checkbox, {
      inputs: { disabled } as any,
    });
    disabled.set(true);

    await expect.element(locator).toHaveAttribute('data-disabled');
  });

  it('should change checked status if clicked', async () => {
    const { locator } = await render(Checkbox);

    await expect.element(locator).not.toBeChecked();
    await locator.click();
    await expect.element(locator).toBeChecked();

    await expect.element(locator).toHaveAttribute('aria-checked', 'true');
  });

  describe('forms integration', () => {
    it('start form integration', async () => {
      const { componentClassInstance: component } = await setupForm();

      expect(component.stateDir().checked()).toBeFalsy();
      expect(component.field().value()).toBeFalsy();
    });

    it('should update form value on click', async () => {
      const { componentClassInstance: component, locator } = await setupForm();

      await locator.getByRole('checkbox').click();
      expect(component.stateDir().checked()).toBeTruthy();
      expect(component.field().value()).toBeTruthy();
    });
  });
});
