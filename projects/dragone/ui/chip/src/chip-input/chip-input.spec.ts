import { signal } from '@angular/core';
import { render } from '@wismaz/vitest-browser-angular';
import { userEvent } from 'vitest/browser';

import { ChipInput } from './chip-input';

const validSvgIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z"/></svg>';

describe(ChipInput, () => {
  const label = signal('Test Chip');
  const disabled = signal(false);
  const removeAriaLabel = signal<string | undefined>(undefined);
  const removeSpy = vi.fn<() => void>();

  afterEach(() => {
    label.set('Test Chip');
    disabled.set(false);
    removeAriaLabel.set(undefined);
    removeSpy.mockClear();
  });

  it('should render the label', async () => {
    const { locator } = await render(ChipInput, { inputs: { label } });

    await expect.element(locator.getByText('Test Chip')).toBeInTheDocument();
  });

  it('should use the label to build the default remove aria-label', async () => {
    const { locator } = await render(ChipInput, { inputs: { label } });

    const closeButton = locator.getByRole('button');
    await expect.element(closeButton).toHaveAttribute('aria-label', 'Remove Test Chip');
  });

  it('should emit remove when the close button is clicked', async () => {
    const { locator } = await render(ChipInput, {
      inputs: { label },
      outputs: { remove: removeSpy },
    });

    await locator.getByRole('button').click();

    expect(removeSpy).toHaveBeenCalledOnce();
  });

  it('should update the rendered label and aria-label reactively', async () => {
    const { locator } = await render(ChipInput, { inputs: { label } });

    label.set('Nuova chip');

    await expect.element(locator.getByText('Nuova chip')).toBeInTheDocument();
    await expect
      .element(locator.getByRole('button'))
      .toHaveAttribute('aria-label', 'Remove Nuova chip');
  });

  it('should prioritize removeAriaLabel over the default', async () => {
    const { locator } = await render(ChipInput, {
      inputs: { label, removeAriaLabel },
    });

    removeAriaLabel.set('Elimina chip');

    await expect.element(locator.getByRole('button')).toHaveAttribute('aria-label', 'Elimina chip');
  });

  it('should disable the close button and mark the host as disabled', async () => {
    const { locator } = await render(ChipInput, {
      inputs: { label, disabled },
    });

    disabled.set(true);

    await expect.element(locator.getByRole('button')).toBeDisabled();
    await expect.element(locator).toHaveAttribute('data-disabled');
  });

  it('should not emit remove when the close button is disabled', async () => {
    const { locator } = await render(ChipInput, {
      inputs: { label, disabled },
      outputs: { remove: removeSpy },
    });

    disabled.set(true);

    await expect.element(locator.getByRole('button')).toBeDisabled();
    expect(removeSpy).not.toHaveBeenCalled();
  });

  it('should render the leading icon hidden from the accessibility tree', async () => {
    const { locator } = await render(ChipInput, {
      inputs: { label, icon: signal(validSvgIcon) },
    });
    const leadingIcon = locator.getByTestId('leading-icon');
    await expect.element(leadingIcon).toHaveAttribute('aria-hidden', 'true');
  });

  it('should not render the leading icon when none is provided', async () => {
    const { locator } = await render(ChipInput, { inputs: { label } });

    await expect.element(locator.getByTestId('leading-icon')).not.toBeInTheDocument();
  });

  it('should expose a keyboard-accessible close button', async () => {
    const { locator } = await render(ChipInput, { inputs: { label } });

    await userEvent.tab();

    await expect.element(locator.getByRole('button')).toHaveFocus();
  });

  it('should set the host tabindex so the chip is not a tab stop', async () => {
    const { locator } = await render(ChipInput, { inputs: { label } });

    await expect.element(locator).toHaveAttribute('tabindex', '-1');
  });
});
