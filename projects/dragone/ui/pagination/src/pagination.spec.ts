import { Component, input, output, signal } from '@angular/core';
import { render } from '@wismaz/vitest-browser-angular';
import { userEvent } from 'vitest/browser';

import { Pagination } from './pagination';

@Component({
  imports: [Pagination],
  template: `
    <drgn-pagination
      [page]="page()"
      [pageCount]="pageCount()"
      [disabled]="disabled()"
      [siblingCount]="siblingCount()"
      [showPages]="showPages()"
      [showNav]="showNav()"
      (pageChange)="pageChange.emit($event)"
    />
  `
})
class TestHost {
  readonly page = input(1);
  readonly pageCount = input(10);
  readonly disabled = input(false);
  readonly siblingCount = input(2);
  readonly showPages = input(true);
  readonly showNav = input(true);
  readonly pageChange = output<number>();
}

@Component({
  imports: [Pagination],
  template: `<drgn-pagination [pageCount]="pageCount()" [(page)]="page" />`
})
class TwoWayHost {
  readonly pageCount = input(10);
  /** A plain property, like a Storybook arg: `[(page)]` works without a signal. */
  page = 1;
}

@Component({
  imports: [Pagination],
  template: `<drgn-pagination [pageCount]="pageCount()" [(page)]="page" />`
})
class SignalHost {
  readonly pageCount = input(10);
  /** A signal, so a test can drive the page from outside and have the template react. */
  readonly page = signal(1);
}

describe(Pagination, () => {
  const page = signal(1);
  const pageCount = signal(10);
  const disabled = signal(false);
  const showPages = signal(true);
  const showNav = signal(true);
  const pageChange = vi.fn<(value: number) => void>();

  afterEach(() => {
    page.set(1);
    pageCount.set(10);
    disabled.set(false);
    showPages.set(true);
    showNav.set(true);
    pageChange.mockClear();
  });

  it('should render a navigation landmark with the page buttons', async () => {
    const { locator } = await render(TestHost, { inputs: { pageCount } });

    const navigation = locator.getByRole('navigation', { name: 'Paginazione' });
    await expect.element(navigation).toBeInTheDocument();
    await expect.element(locator.getByRole('button', { name: 'Pagina 1' })).toBeInTheDocument();
    await expect.element(locator.getByRole('button', { name: 'Pagina 10' })).toBeInTheDocument();
  });

  it('should mark the current page with aria-current', async () => {
    const { locator } = await render(TestHost, { inputs: { page, pageCount } });

    await expect
      .element(locator.getByRole('button', { name: 'Pagina 1' }))
      .toHaveAttribute('aria-current', 'page');
    await expect
      .element(locator.getByRole('button', { name: 'Pagina 2' }))
      .not.toHaveAttribute('aria-current');
  });

  it('should emit the page the user picks', async () => {
    const { locator } = await render(TestHost, {
      inputs: { page, pageCount },
      outputs: { pageChange }
    });

    await locator.getByRole('button', { name: 'Pagina 3' }).click();

    expect(pageChange).toHaveBeenCalledWith(3);
  });

  it('should keep the same number of cells on every page', async () => {
    // The strip must not change width as the user navigates: a growing window both widened the
    // component and delayed the leading ellipsis.
    const { componentClassInstance, fixture, locator } = await render(SignalHost, {
      inputs: { pageCount }
    });
    const host = locator.getByRole('navigation').element() as HTMLElement;
    const cells = () =>
      host.querySelectorAll('button[data-page]').length +
      host.querySelectorAll('li.ellipsis').length;
    const counts = new Set<number>();

    for (let current = 1; current <= 10; current += 1) {
      componentClassInstance.page.set(current);
      await fixture.whenStable();
      counts.add(cells());
    }

    expect([...counts]).toEqual([7]);
  });

  it('should show the leading ellipsis from the third page on', async () => {
    const { componentClassInstance, fixture, locator } = await render(SignalHost, {
      inputs: { pageCount }
    });
    const host = locator.getByRole('navigation').element() as HTMLElement;
    const ellipses = () => host.querySelectorAll('li.ellipsis').length;

    componentClassInstance.page.set(2);
    await fixture.whenStable();
    // Page 2 still reaches page 1, so only the trailing run is skipped.
    expect(ellipses()).toBe(1);

    componentClassInstance.page.set(3);
    await fixture.whenStable();
    expect(ellipses()).toBe(2);
  });

  it('should center the strip on the current page so the one before stays clickable', async () => {
    // Reported from the UI: with the window opening on the current page, page 3 showed "3 4 5" and
    // the only way back was the previous button.
    const { componentClassInstance, fixture, locator } = await render(SignalHost, {
      inputs: { pageCount }
    });
    const host = locator.getByRole('navigation').element() as HTMLElement;
    const numbers = () =>
      [...host.querySelectorAll('button[data-page]')].map(button => button.textContent?.trim());

    componentClassInstance.page.set(3);
    await fixture.whenStable();
    expect(numbers()).toEqual(['1', '2', '3', '4', '10']);

    await locator.getByRole('button', { name: 'Pagina 2' }).click();

    expect(componentClassInstance.page()).toBe(2);
  });

  it('should navigate when the consumer binds page two-way', async () => {
    // The stories and real consumers must two-way bind `page`: a one-way binding pins the
    // Primitive's controlled state and the strip would emit without moving.
    const { componentClassInstance, locator } = await render(TwoWayHost, {
      inputs: { pageCount }
    });
    expect(componentClassInstance.page).toBe(1);

    await locator.getByRole('button', { name: 'Pagina 3' }).click();

    expect(componentClassInstance.page).toBe(3);
    await expect
      .element(locator.getByRole('button', { name: 'Pagina 3' }))
      .toHaveAttribute('aria-current', 'page');
  });

  it('should disable the previous button on the first page', async () => {
    const { locator } = await render(TestHost, { inputs: { page, pageCount } });

    await expect.element(locator.getByRole('button', { name: 'Pagina precedente' })).toBeDisabled();
    await expect.element(locator.getByRole('button', { name: 'Pagina successiva' })).toBeEnabled();
  });

  it('should disable the next button on the last page', async () => {
    const { locator } = await render(TestHost, { inputs: { page, pageCount } });
    page.set(10);

    await expect.element(locator.getByRole('button', { name: 'Pagina successiva' })).toBeDisabled();
  });

  it('should render an ellipsis for a skipped run of pages', async () => {
    const { locator } = await render(TestHost, { inputs: { page, pageCount } });

    await expect.element(locator.getByText('…')).toBeInTheDocument();
    await expect.element(locator.getByRole('button', { name: 'Pagina 7' })).not.toBeInTheDocument();
  });

  it('should hide the page buttons when showPages is off', async () => {
    const { locator } = await render(TestHost, { inputs: { page, pageCount, showPages } });
    showPages.set(false);

    await expect.element(locator.getByRole('button', { name: 'Pagina 1' })).not.toBeInTheDocument();
    await expect
      .element(locator.getByRole('button', { name: 'Pagina precedente' }))
      .toBeInTheDocument();
  });

  it('should hide the previous/next buttons when showNav is off', async () => {
    const { locator } = await render(TestHost, { inputs: { page, pageCount, showNav } });
    showNav.set(false);

    await expect
      .element(locator.getByRole('button', { name: 'Pagina successiva' }))
      .not.toBeInTheDocument();
    await expect.element(locator.getByRole('button', { name: 'Pagina 1' })).toBeInTheDocument();
  });

  it('should reuse the page button element when the window shifts', async () => {
    const { locator } = await render(TestHost, { inputs: { page, pageCount } });
    const lastPage = locator.getByRole('button', { name: 'Pagina 10' });
    const before = lastPage.element();

    page.set(5);

    // "Pagina 6" only exists in the page-5 window, so waiting for it proves the window shifted.
    await expect.element(locator.getByRole('button', { name: 'Pagina 6' })).toBeInTheDocument();
    // Same DOM node: Angular moved the tracked view instead of recreating it, so focus survives.
    expect(lastPage.element()).toBe(before);
  });

  it('should keep the disabled current page readable', async () => {
    const { locator } = await render(TestHost, { inputs: { page, pageCount, disabled } });
    const current = locator.getByRole('button', { name: 'Pagina 1' });
    disabled.set(true);

    await expect.element(current).toBeDisabled();
    // The disabled colour must win over the selected one, or the page number disappears on the fill.
    expect(getComputedStyle(current.element()).color).toBe('rgb(91, 101, 113)');
  });

  it('should fill the current page with the darkest shade', async () => {
    const { locator } = await render(TestHost, { inputs: { page, pageCount } });
    const current = locator.getByRole('button', { name: 'Pagina 1' });

    await expect.element(current).toHaveAttribute('data-selected');
    expect(getComputedStyle(current.element()).backgroundColor).toBe('rgb(0, 23, 61)');
  });

  it('should fill a hovered page tile with the hover shade', async () => {
    const { locator } = await render(TestHost, { inputs: { page, pageCount } });
    const tile = locator.getByRole('button', { name: 'Pagina 3' });

    await tile.hover();

    await vi.waitFor(() =>
      expect(getComputedStyle(tile.element()).backgroundColor).toBe('rgb(0, 54, 143)')
    );
  });

  it('should keep the prev/next hover light so the chevrons stay bare', async () => {
    const { locator } = await render(TestHost, { inputs: { page, pageCount } });
    const next = locator.getByRole('button', { name: 'Pagina successiva' });

    await next.hover();

    await vi.waitFor(() =>
      expect(getComputedStyle(next.element()).backgroundColor).toBe('rgb(217, 228, 247)')
    );
  });

  it('should draw the spec focus border and glow on the keyboard-focused tile', async () => {
    const { locator } = await render(TestHost, { inputs: { page, pageCount } });
    await locator.getByRole('button', { name: 'Pagina 3' }).click();
    await userEvent.tab();

    const focused = locator.getByRole('button', { name: 'Pagina 4' });
    await expect.element(focused).toHaveAttribute('data-focus-visible');
    await vi.waitFor(() => {
      const style = getComputedStyle(focused.element());
      expect(style.borderColor).toBe('rgb(0, 101, 209)');
      expect(style.boxShadow).not.toBe('none');
    });
  });

  it('should disable every button when the strip is disabled', async () => {
    const { locator } = await render(TestHost, { inputs: { page, pageCount, disabled } });
    disabled.set(true);

    await expect.element(locator.getByRole('button', { name: 'Pagina 3' })).toBeDisabled();
    await expect.element(locator.getByRole('button', { name: 'Pagina successiva' })).toBeDisabled();
  });
});
