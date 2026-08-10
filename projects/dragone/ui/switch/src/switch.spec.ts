/* eslint-disable @typescript-eslint/no-explicit-any */
// oxlint-disable typescript/no-explicit-any
import { Component, signal, viewChild } from '@angular/core';
import { disabled, form, FormField, hidden, readonly } from '@angular/forms/signals';
import { render } from '@wismaz/vitest-browser-angular';
import { NgpSwitch } from 'ng-primitives/switch';
import { userEvent } from 'vitest/browser';

import { Switch } from './switch';

const setupForm = () => {
  @Component({
    imports: [FormField, Switch],
    template: `<drgn-switch [formField]="field" />`,
  })
  class FormCmp {
    isDisabled = signal(false);
    isReadonly = signal(false);
    isHidden = signal(false);
    readonly field = form(signal(false), path => {
      disabled(path, { when: this.isDisabled });
      readonly(path, { when: this.isReadonly });
      hidden(path, { when: this.isHidden });
    });
    readonly stateDir = viewChild.required(NgpSwitch);
  }

  return render(FormCmp);
};

describe(Switch, () => {
  const touchSpy = vi.fn<() => void>();
  const readonly = signal(false);
  const hidden = signal(false);
  const disabled = signal(false);

  afterEach(() => {
    readonly.set(false);
    hidden.set(false);
    disabled.set(false);
    touchSpy.mockReset();
  });

  it('should toggle checked state on click', async () => {
    const { locator } = await render(Switch);
    await expect.element(locator).toHaveAttribute('aria-checked', 'false');
    await locator.click();
    await expect.element(locator).toHaveAttribute('aria-checked', 'true');
  });

  it('should emit touch event on blur', async () => {
    await render(Switch, { outputs: { touch: touchSpy } });
    await userEvent.tab();
    expect(touchSpy).not.toHaveBeenCalled();
    await userEvent.tab();
    expect(touchSpy).toHaveBeenCalledOnce();
  });

  it('should not be interactive when readonly', async () => {
    const { locator } = await render(Switch, { inputs: { readonly } });
    readonly.set(true);

    await expect.element(locator).toHaveAttribute('data-readonly');
    await expect.element(locator).toHaveAttribute('aria-checked', 'false');
  });

  it('should be hidden when hidden is true', async () => {
    const { locator } = await render(Switch, { inputs: { hidden } });
    hidden.set(true);
    await expect.element(locator).toHaveAttribute('data-hidden');
    await expect.element(locator).not.toBeInViewport();
  });

  it('should be disabled', async () => {
    const { locator } = await render(Switch, { inputs: { disabled } as any });
    await expect.element(locator).toHaveAttribute('aria-disabled', 'false');
    disabled.set(true);
    await expect.element(locator).toHaveAttribute('aria-disabled', 'true');
  });

  describe('form integration', () => {
    it('should update form value on toggle', async () => {
      const {
        componentClassInstance: { field },
        locator,
      } = await setupForm();
      const switchElement = await locator.getByRole('switch');
      await expect.element(switchElement).toHaveAttribute('aria-checked', 'false');
      expect(field().value()).toBeFalsy();
      await switchElement.click();
      await expect.element(switchElement).toHaveAttribute('aria-checked', 'true');
      expect(field().value()).toBeTruthy();
    });

    it('should disable component trough form api', async () => {
      const {
        componentClassInstance: { field, isDisabled },
        locator,
      } = await setupForm();
      const switchElement = await locator.getByRole('switch');
      await expect.element(switchElement).toHaveAttribute('aria-disabled', 'false');
      expect(field().disabled()).toBeFalsy();
      isDisabled.set(true);
      await expect.element(switchElement).toHaveAttribute('aria-disabled', 'true');
      expect(field().disabled()).toBeTruthy();
    });

    it('should readonly component trough form api', async () => {
      const {
        componentClassInstance: { field, isReadonly },
        locator,
      } = await setupForm();
      const switchElement = await locator.getByRole('switch');
      await expect.element(switchElement).not.toHaveAttribute('data-readonly');
      expect(field().readonly()).toBeFalsy();
      isReadonly.set(true);
      await expect.element(switchElement).toHaveAttribute('data-readonly');
      expect(field().readonly()).toBeTruthy();
    });

    it('should hidden component trough form api', async () => {
      const {
        componentClassInstance: { field, isHidden },
        locator,
      } = await setupForm();
      const switchElement = await locator.getByRole('switch');
      await expect.element(switchElement).not.toHaveAttribute('data-hidden');
      expect(field().hidden()).toBeFalsy();
      isHidden.set(true);
      await expect.element(switchElement).not.toBeInViewport();
      expect(field().hidden()).toBeTruthy();
    });
  });
});
