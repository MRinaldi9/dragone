import { Component, input, signal } from '@angular/core';
import { render } from '@wismaz/vitest-browser-angular';
import { userEvent } from 'vitest/browser';

import { RadioItem } from '../radio-item/radio-item';
import { RadioGroup } from './radio-group';

@Component({
  imports: [RadioGroup, RadioItem],
  template: `
    <drgn-radio-group orientation="vertical" [disabled]="disabled()" [readonly]="readonly()">
      <drgn-radio-item value="option1">Opzione 1</drgn-radio-item>
      <drgn-radio-item value="option2">Opzione 2</drgn-radio-item>
      <drgn-radio-item value="option3">Opzione 3</drgn-radio-item>
    </drgn-radio-group>
  `,
})
class RadioGroupTest {
  disabled = input(false);
  readonly = input(false);
}

describe(RadioGroup, () => {
  const disabled = signal(false);
  const readonly = signal(false);

  afterEach(() => {
    disabled.set(false);
    readonly.set(false);
  });

  it('should focus and select the first radio item on keyboard navigation', async () => {
    const { locator } = await render(RadioGroupTest);
    const radioItem = locator.getByRole('radio').first();

    await userEvent.tab();
    await expect.element(radioItem).toHaveAttribute('aria-checked', 'true');
    await expect.element(radioItem).toHaveFocus();
  });

  it('should focus and select the radio item based on the keyboard navigation', async () => {
    const { locator } = await render(RadioGroupTest);
    const radioItem = locator.getByRole('radio').nth(1);

    assert(radioItem, 'Expected at least two radio items');
    await userEvent.tab();

    await userEvent.keyboard('[ArrowDown]');
    await expect.element(radioItem).toHaveAttribute('aria-checked', 'true');
    await expect.element(radioItem).toHaveFocus();
  });

  it('should not change selection when disabled', async () => {
    const { locator } = await render(RadioGroupTest, { inputs: { disabled } });
    disabled.set(true);
    const radioItem = locator.getByRole('radio').first();

    await userEvent.tab();
    await expect.element(radioItem).toHaveAttribute('aria-checked', 'false');
  });

  it('should not change selection when readonly', async () => {
    const { locator } = await render(RadioGroupTest, { inputs: { readonly } });
    readonly.set(true);

    const radioItem = locator.getByRole('radio').first();
    await userEvent.tab();
    await expect.element(radioItem).toHaveAttribute('aria-checked', 'false');
  });
});
