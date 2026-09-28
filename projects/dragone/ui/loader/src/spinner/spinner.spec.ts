import { Component, input, signal } from '@angular/core';
import { render } from '@wismaz/vitest-browser-angular';

import { Spinner, type SpinnerSize } from './spinner';

@Component({
  imports: [Spinner],
  template: ` <drgn-spinner [label]="label()" [size]="size()" /> `
})
class TestHostComponent {
  readonly label = input('Caricamento in corso');
  readonly size = input<SpinnerSize>('medium');
}

describe(Spinner, () => {
  const label = signal('Caricamento in corso');
  const size = signal<SpinnerSize>('medium');

  afterEach(() => {
    label.set('Caricamento in corso');
    size.set('medium');
  });

  it('must expose a status role with the accessible name', async () => {
    const { locator } = await render(TestHostComponent, { inputs: { label } });

    await expect
      .element(locator.getByRole('status', { name: 'Caricamento in corso' }))
      .toBeVisible();
  });

  it('must update the accessible name when the label changes', async () => {
    const { locator } = await render(TestHostComponent, { inputs: { label } });
    label.set('Salvataggio bozza');

    await expect.element(locator.getByRole('status', { name: 'Salvataggio bozza' })).toBeVisible();
  });

  it('must fall back to the default name when the label is empty or blank', async () => {
    const { locator } = await render(TestHostComponent, { inputs: { label } });

    label.set('');
    await expect
      .element(locator.getByRole('status', { name: 'Caricamento in corso' }))
      .toBeVisible();

    label.set('   ');
    await expect
      .element(locator.getByRole('status', { name: 'Caricamento in corso' }))
      .toBeVisible();
  });

  it('must expose the default medium size', async () => {
    const { locator } = await render(TestHostComponent, { inputs: { label, size } });

    await expect.element(locator.getByRole('status')).toHaveAttribute('data-size', 'medium');
  });

  it('must scale with the size input', async () => {
    const { fixture, locator } = await render(TestHostComponent, { inputs: { label, size } });
    size.set('small');

    const spinner = locator.getByRole('status');
    await expect.element(spinner).toHaveAttribute('data-size', 'small');
    await fixture.whenStable();

    const host = fixture.nativeElement.querySelector('drgn-spinner') as HTMLElement | null;
    expect(host).not.toBeNull();
    expect(getComputedStyle(host as HTMLElement).width).toBe('32px');
  });

  it('must hide the decorative artwork from assistive technologies', async () => {
    const { locator } = await render(TestHostComponent, { inputs: { label } });
    const rotor = locator.getByTestId('spinner-rotor');

    await expect.element(rotor).toHaveAttribute('aria-hidden', 'true');
    await expect.element(locator.getByTestId('spinner-ring')).toBeInTheDocument();
    await expect.element(locator.getByTestId('spinner-head')).toBeInTheDocument();
  });
});
