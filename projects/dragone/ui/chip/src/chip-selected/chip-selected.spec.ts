import { Component, input, model, signal, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { disabled, form, FormField } from '@angular/forms/signals';
import { render } from '@wismaz/vitest-browser-angular';
import { page, userEvent } from 'vitest/browser';

import { ChipSelected } from './chip-selected';

const setupForm = async () => {
  @Component({
    imports: [FormField, ChipSelected],
    template: `<button drgn-chip-selected [formField]="field">Test</button>`,
  })
  class FormCmp {
    isDisabled = signal(false);
    readonly field = form(signal(false), path => {
      disabled(path, { when: () => this.isDisabled() });
    });
    readonly chip = viewChild.required(ChipSelected);
  }

  return await render(FormCmp);
};
const setupReactiveForm = async (isDisabled = false) => {
  @Component({
    imports: [ChipSelected, ReactiveFormsModule],
    template: ` <button drgn-chip-selected [formControl]="fcontrol">Test</button> `,
  })
  class TestHostFormComponent {
    fcontrol = new FormControl({ value: false, disabled: isDisabled }, { nonNullable: true });
  }
  return await render(TestHostFormComponent);
};

@Component({
  imports: [ChipSelected],
  template: `
    <button drgn-chip-selected [disabled]="disabled()" [(checked)]="checked">
      {{ label() }}
    </button>
  `,
})
class TestHostComponent {
  checked = model(false);
  disabled = input(false);
  label = input('Test');
}

describe(ChipSelected, () => {
  describe('standalone behavior', () => {
    const checked = signal(false);
    const disabled = signal(false);
    const label = signal('Test');

    afterEach(() => {
      checked.set(false);
      disabled.set(false);
      label.set('Test');
    });

    it('should default to unselected', async () => {
      const { locator } = await render(TestHostComponent);
      const button = locator.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('should toggle selected state on click', async () => {
      const { locator } = await render(TestHostComponent, { inputs: { checked } });
      const button = locator.getByRole('button');
      await button.click();
      expect(checked()).toBeTruthy();
      await expect.element(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should toggle selected state programmatically', async () => {
      const { locator } = await render(TestHostComponent, { inputs: { checked } });
      const button = locator.getByRole('button');
      checked.set(true);

      await expect.element(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should not toggle when disabled', async () => {
      const { locator } = await render(TestHostComponent, { inputs: { checked, disabled } });
      const button = locator.getByRole('button');
      disabled.set(true);

      await userEvent.keyboard('{Tab}');
      expect(checked()).toBeFalsy();
      await expect.element(button).not.toHaveAttribute('data-focus-visible');
      await expect.element(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('should expose disabled state to the primitive', async () => {
      const { locator } = await render(TestHostComponent, { inputs: { checked, disabled } });
      const button = locator.getByRole('button');
      disabled.set(true);

      await expect.element(button).toHaveAttribute('data-disabled');
      await expect.element(button).toHaveAttribute('aria-disabled', 'true');
      await expect.element(button).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('signal forms integration', () => {
    it('should bind the initial form value', async () => {
      const { componentClassInstance: component } = await setupForm();

      expect(component.field().value()).toBeFalsy();
      await expect.element(page.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
    });

    it('should update the form value on click', async () => {
      const { componentClassInstance: component, locator } = await setupForm();
      const btn = locator.getByRole('button');
      await btn.click();
      expect(component.field().value()).toBeTruthy();
      await expect.element(btn).toHaveAttribute('aria-pressed', 'true');
    });

    it('should reflect a programmatic form value change', async () => {
      const { componentClassInstance: component } = await setupForm();

      component.field().value.set(true);
      await expect.element(page.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    });

    it('should emit touch on blur', async () => {
      const { componentClassInstance: component } = await setupForm();

      await userEvent.tab();
      await userEvent.tab();
      expect(component.field().touched()).toBeTruthy();
    });

    it('should focus the chip through the control contract', async () => {
      const { componentClassInstance: component } = await setupForm();
      const button = page.getByRole('button').element();

      const focusSpy = vi.spyOn(button, 'focus');
      component.chip().focus({ preventScroll: true });
      expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
    });

    it('should reset the chip through the control contract', async () => {
      const { componentClassInstance: component, locator } = await setupForm();

      await locator.getByRole('button').click();
      expect(component.field().value()).toBeTruthy();

      component.field().reset();
      expect(component.field().value()).toBeTruthy();
      expect(component.field().touched()).toBeFalsy();
      await expect.element(locator.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    });

    it('should restore the field value on reset with a value', async () => {
      const { componentClassInstance: component, locator } = await setupForm();

      await locator.getByRole('button').click();
      expect(component.field().value()).toBeTruthy();

      component.field().reset(false);
      expect(component.field().value()).toBeFalsy();
      await expect.element(locator.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
    });

    it('should disable the chip when the field is disabled', async () => {
      const { componentClassInstance: component, locator } = await setupForm();
      const btn = locator.getByRole('button');
      await expect.element(btn).not.toHaveAttribute('data-disabled');

      component.isDisabled.set(true);
      await expect.element(btn).toHaveAttribute('data-disabled');
      btn.element().dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(component.field().value()).toBeFalsy();
    });
  });

  describe('reactive forms interop', () => {
    it('should toggle the form control on click', async () => {
      const { componentClassInstance: component, locator } = await setupReactiveForm();

      await locator.getByRole('button').click();
      expect(component.fcontrol.value).toBeTruthy();
    });

    it('should disable the form control', async () => {
      const { componentClassInstance: component } = await setupReactiveForm(true);
      const fControl = component.fcontrol;
      expect(fControl.disabled).toBeTruthy();

      fControl.enable();
      expect(fControl.disabled).toBeFalsy();
    });
  });
});
